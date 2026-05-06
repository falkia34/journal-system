## Why

The journal system currently has no domain model. Before building any UI or API, we need a well-defined domain layer that captures the core entities, their relationships, and business rules. This is the foundation of the clean architecture — every use case, repository, and presentation component will depend on these domain entities being correct and complete.

## What Changes

- Replace the current placeholder entities (User, Journal, Article, Review, Revision) with a redesigned domain model that reflects the actual OJS-like workflow
- Introduce new entities: **Submission** (replaces Article as the workflow container), **Decision** (tracks stage transitions), **Feedback** (reviewer/editor comments), **Publication** (final published artifact), **Issue** (journal issue grouping)
- Redesign **User** to support multiple roles (Author, Reviewer, Editor, Administrator) with role-switching view context
- Redesign **Revision** to carry file metadata, start stage, latest stage, and frozen-state semantics — when edits are required, the current revision is frozen and a new revision is created
- Define **Journal → Issue → Publication** hierarchy: journals contain issues, issues contain publications, publications point to the accepted final revision
- Define **Decision** as the mechanism for stage transitions: each Decision records which Revision and Submission it applies to
- Define **Feedback** as role-specific input (reviewer or editorial) created during review or editorial stages

## Capabilities

### New Capabilities
- `domain-entities`: Core domain entities, value objects, enums, and their relationships for the journal system (User, Journal, Submission, Revision, Decision, Feedback, Publication, Issue, and supporting enums)

### Modified Capabilities
(None — no existing specs to modify)

## Impact

- **`src/domain/entities/`** — All current placeholder entities will be replaced
- **`src/domain/repositories/`** — Repository interfaces must be updated to match new entities (Submission, Decision, Feedback, Publication, Issue, plus User/Journal changes)
- **`src/domain/errors/`** — May need new domain-specific errors
- **`src/domain/index.ts`** — Barrel exports must be updated
- **`config/symbols.ts`** — DI symbols must be updated to match new repository interfaces
- **`src/application/`** — Existing use cases reference old entities; they will need updating
- **`src/infrastructure/`** — Repository stubs and DTOs reference old entities; they will need updating
- **`prisma/schema.prisma`** — Must be updated to match the new domain model
- **BREAKING**: Removes Article entity (replaced by Submission); removes Review entity (split into Feedback + Decision)