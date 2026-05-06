## Context

The journal system is an OJS-like platform for managing academic journal workflows. The existing scaffold has placeholder entities (User, Journal, Article, Review, Revision) that don't capture the real domain semantics. The project follows clean architecture with Inversify DI: `domain` has zero external dependencies and defines repository interfaces; `application` holds use cases; `infrastructure` implements repositories; `presentation` is the UI layer.

The domain layer is the innermost ring — everything else depends on it. Getting the entities right before building outward is critical.

## Goals / Non-Goals

**Goals:**
- Define all 8 domain entities with correct attributes and value objects
- Model the entity relationships and lifecycle transitions accurately
- Define enums for roles (Author, Reviewer, Editor, Administrator) and lifecycle stages
- Define repository interfaces for each entity
- Ensure the domain layer has ZERO external dependencies (pure TypeScript)
- Support the multi-role User pattern where a single user can hold multiple roles and switch view context

**Non-Goals:**
- Implementation of repositories (infrastructure concern)
- UI components or routing (presentation concern)
- Use case logic (application concern)
- Authentication/authorization enforcement (application concern)
- Database schema design (infrastructure concern — Prisma will follow later)

## Decisions

### D1: Submission replaces Article as the workflow container

**Decision**: The entity that an author creates is called `Submission`, not `Article`. A Submission is the entire workflow unit — from initial upload through review, revision, and potential publication. The word "Article" is ambiguous (could mean the submission or the published piece).

**Rationale**: In OJS, "submission" is the lifecycle container. An article is what a submission becomes after acceptance. This naming clarifies that we're tracking the editorial process, not just a document.

**Alternative considered**: Keep `Article` — rejected because it conflates the process with the output.

### D2: Review is split into Feedback + Decision

**Decision**: The old `Review` entity is replaced by two separate entities:
- **Feedback**: Role-specific input from a reviewer or editor (comments, scores, recommendations)
- **Decision**: A formal record of a stage transition on a Revision within a Submission

**Rationale**: In academic journal workflows, "review" conflates two distinct concerns: (1) providing feedback/comments and (2) making a decision that moves the submission to a new stage. Separating these allows a reviewer to give feedback without making a decision, and an editor to make a decision referencing multiple pieces of feedback.

**Alternative considered**: Keep a single `Review` entity with a `type` field — rejected because it creates a god entity that's hard to query and reason about.

### D3: Revision carries stage lifecycle, not Submission

**Decision**: Each `Revision` has `startStage` and `currentStage` fields. When an edit is required (e.g., revisions requested), the current Revision is **frozen** (`isFrozen: true`) and a new Revision is created starting at the appropriate stage.

**Rationale**: This models the real workflow: when reviewers request changes, the submitted version is preserved (frozen) and the author uploads a new version. The stage lifecycle belongs to the Revision because each version of the manuscript has its own editorial journey.

**Alternative considered**: Keep stage on Submission — rejected because a Submission can have multiple Revisions at different stages simultaneously (the frozen one and the active one).

### D4: User supports multiple roles via a roles array

**Decision**: A `User` has a `roles` array (enum values: Author, Reviewer, Editor, Administrator). The active view context is determined by which role the user is currently operating under, not by separate user records.

**Rationale**: In academic publishing, the same person is often both an author and a reviewer. Creating separate accounts per role is a poor UX. The domain model should support role switching at the application/presentation layer.

**Alternative considered**: Separate `AuthorProfile`, `ReviewerProfile` tables — rejected as premature normalization. Role-specific data can be added later as value objects or linked entities if needed.

### D5: Publication points to the accepted final Revision

**Decision**: A `Publication` entity links a Journal Issue to a specific Revision (the final accepted version). This indirection allows the same submission's different revisions to be tracked, while the published version is explicitly the accepted one.

**Rationale**: In OJS, the galley/production step selects which revision to publish. Making this explicit in the domain model avoids the ambiguity of "which version was published?"

**Alternative considered**: Copy article content into Publication at publish time — rejected because it loses the traceability to the specific revision.

### D6: Value objects for File metadata

**Decision**: Revision files are modeled as a `RevisionFile` value object (not a separate entity), containing `filename`, `originalName`, `mimeType`, and `size`.

**Rationale**: Files are owned by a Revision — they don't have independent identity. Using a value object keeps the domain clean and avoids a separate repository. Cloud storage paths are an infrastructure concern handled in the repository implementation.

### D7: Entity identification uses UUID strings

**Decision**: All entities use `id: string` (UUID v4). No auto-increment integers.

**Rationale**: UUIDs are globally unique, work across distributed systems, and don't leak record counts. The domain layer defines the type; the infrastructure layer generates the values.

## Risks / Trade-offs

- **Risk**: Freezing Revisions creates complexity in querying "the active version" → Mitigation: Use `isFrozen = false` as the primary filter for active revisions; add a `latestRevision` computed property or query helper on Submission.
- **Risk**: Multi-role users complicate authorization at the repository level → Mitigation: Authorization is an application-layer concern. The domain model makes roles available; use cases enforce access rules.
- **Risk**: Decision entity duplication — if every stage transition creates a Decision, the table may grow fast → Mitigation: This is expected and desirable for audit trail. Indexing on `submissionId + revisionId` keeps queries fast.
- **Trade-off**: Using Submission instead of Article means we need a clear mapping to the published "Article" concept → Mitigation: Publication entity serves this purpose; it's the published face of a Submission.

## Entity Relationship Summary

```
User ─────────────────────────────────────────────┐
  roles: Author | Reviewer | Editor | Administrator│
                                                   │
Journal ──── 1:N ──── Issue ──── 1:N ──── Publication
                                                  │
                        points to accepted Revision
                                                  │
Submission ──── 1:N ──── Revision ──── 1:N ──── Decision
    │                     │                  │
    │                     │                  └── references submissionId + revisionId
    │                     │
    │                     └── RevisionFile (value object)
    │                     └── startStage, currentStage, isFrozen
    │
    └── authorId → User

Feedback ──── references submissionId + revisionId
    └── createdBy → User (in Reviewer or Editor role)
```