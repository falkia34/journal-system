## ADDED Requirements

### Requirement: User entity with multi-role support
The system SHALL define a `User` entity with the following attributes:
- `id`: string (UUID)
- `email`: string
- `name`: string
- `roles`: array of `Role` enum values (Author, Reviewer, Editor, Administrator)
- `avatarUrl`: string | null
- `createdAt`: Date
- `updatedAt`: Date

A single User SHALL be able to hold multiple roles simultaneously. The `roles` array MUST contain at least one value.

#### Scenario: User with multiple roles
- **WHEN** a User is created with roles `[Author, Reviewer]`
- **THEN** the User SHALL have access to both Author and Reviewer views
- **AND** the User SHALL be able to switch between role-based views at the presentation layer

#### Scenario: User must have at least one role
- **WHEN** a User is created with an empty roles array
- **THEN** the system SHALL reject the creation as invalid

### Requirement: Role enum
The system SHALL define a `Role` enum with values: `Author`, `Reviewer`, `Editor`, `Administrator`.

#### Scenario: Role values
- **WHEN** the Role enum is referenced
- **THEN** the available values SHALL be exactly Author, Reviewer, Editor, and Administrator

### Requirement: Journal entity
The system SHALL define a `Journal` entity with the following attributes:
- `id`: string (UUID)
- `name`: string
- `description`: string
- `issn`: string | null
- `editorInChiefId`: string (references User with Editor role)
- `createdAt`: Date
- `updatedAt`: Date

#### Scenario: Journal with ISSN
- **WHEN** a Journal is created with an ISSN value
- **THEN** the Journal SHALL store the ISSN as an optional string identifier

#### Scenario: Journal without ISSN
- **WHEN** a Journal is created without an ISSN
- **THEN** the ISSN field SHALL be null

### Requirement: Issue entity
The system SHALL define an `Issue` entity with the following attributes:
- `id`: string (UUID)
- `journalId`: string (references Journal)
- `volume`: number
- `number`: number
- `title`: string
- `description`: string | null
- `publishedAt`: Date | null
- `createdAt`: Date
- `updatedAt`: Date

A Journal SHALL contain zero or more Issues. Each Issue SHALL belong to exactly one Journal.

#### Scenario: Issue in a journal
- **WHEN** an Issue is created with a journalId
- **THEN** the Issue SHALL be associated with that Journal
- **AND** the Journal SHALL list this Issue among its Issues

#### Scenario: Unpublished issue
- **WHEN** an Issue is created but not yet published
- **THEN** the `publishedAt` field SHALL be null

### Requirement: Submission entity
The system SHALL define a `Submission` entity with the following attributes:
- `id`: string (UUID)
- `journalId`: string (references Journal)
- `authorId`: string (references User)
- `title`: string
- `abstract`: string
- `status`: SubmissionStatus enum
- `createdAt`: Date
- `updatedAt`: Date

#### Scenario: Author creates a submission
- **WHEN** an Author creates a Submission
- **THEN** the Submission SHALL reference the Author's User ID
- **AND** the initial status SHALL be `Draft`

#### Scenario: Submission belongs to a journal
- **WHEN** a Submission is created
- **THEN** it SHALL reference a Journal via journalId

### Requirement: SubmissionStatus enum
The system SHALL define a `SubmissionStatus` enum with values: `Draft`, `Submitted`, `UnderReview`, `RevisionsRequested`, `RevisionsSubmitted`, `Accepted`, `Rejected`, `Withdrawn`.

#### Scenario: Submission status lifecycle
- **WHEN** a Submission transitions between statuses
- **THEN** the status SHALL reflect one of the defined SubmissionStatus values

### Requirement: Revision entity with stage lifecycle
The system SHALL define a `Revision` entity with the following attributes:
- `id`: string (UUID)
- `submissionId`: string (references Submission)
- `version`: number (auto-incremented per submission, starting at 1)
- `startStage`: RevisionStage enum
- `currentStage`: RevisionStage enum
- `isFrozen`: boolean
- `files`: array of RevisionFile value objects
- `createdAt`: Date
- `updatedAt`: Date

A Submission SHALL contain one or more Revisions. Only one Revision per Submission SHALL be unfrozen at any time (the active revision).

#### Scenario: Initial revision creation
- **WHEN** an Author creates the first Revision for a Submission
- **THEN** the version SHALL be 1
- **AND** `startStage` and `currentStage` SHALL both be set to the initial stage
- **AND** `isFrozen` SHALL be false

#### Scenario: Freezing a revision upon edit request
- **WHEN** a Decision requires the author to make edits
- **THEN** the current Revision SHALL be frozen (`isFrozen = true`)
- **AND** a new Revision SHALL be created with `version = previous.version + 1`
- **AND** the new Revision's `startStage` SHALL be set to the stage where editing resumes

#### Scenario: Revision with multiple files
- **WHEN** a Revision is created with multiple files
- **THEN** each file SHALL be stored as a RevisionFile value object within the Revision
- **AND** the files array SHALL contain all uploaded manuscript files for that revision

### Requirement: RevisionStage enum
The system SHALL define a `RevisionStage` enum with values: `Draft`, `Submission`, `Review`, `Editorial`, `Production`, `Published`.

#### Scenario: Stage progression
- **WHEN** a Revision transitions between stages
- **THEN** the `currentStage` SHALL be updated to reflect the new stage
- **AND** the transition SHALL be recorded via a Decision entity

### Requirement: RevisionFile value object
The system SHALL define a `RevisionFile` value object with the following attributes:
- `filename`: string (storage filename)
- `originalName`: string (user's original filename)
- `mimeType`: string
- `size`: number (bytes)

#### Scenario: File attachment to revision
- **WHEN** a file is attached to a Revision
- **THEN** the RevisionFile SHALL capture both the storage filename and the user's original filename
- **AND** the MIME type and file size SHALL be recorded

### Requirement: Decision entity for stage transitions
The system SHALL define a `Decision` entity with the following attributes:
- `id`: string (UUID)
- `submissionId`: string (references Submission)
- `revisionId`: string (references Revision)
- `deciderId`: string (references User — must have Editor or Administrator role)
- `stage`: RevisionStage (the stage this decision applies to)
- `decisionType`: DecisionType enum
- `comment`: string | null
- `createdAt`: Date
- `updatedAt`: Date

Each stage transition on a Revision SHALL be recorded via a Decision. A Decision SHALL reference both the Submission and the Revision it applies to.

#### Scenario: Editor accepts a submission
- **WHEN** an Editor creates a Decision with `decisionType = Accept`
- **THEN** the Submission status SHALL transition to `Accepted`
- **AND** the Revision's `currentStage` SHALL transition to `Published`

#### Scenario: Editor requests revisions
- **WHEN** an Editor creates a Decision with `decisionType = RevisionsRequired`
- **THEN** the Submission status SHALL transition to `RevisionsRequested`
- **AND** the current Revision SHALL be frozen
- **AND** a new Revision SHALL be created for the author to upload changes

#### Scenario: Reviewer recommends a decision (not final)
- **WHEN** a Reviewer creates a Decision with `decisionType = RecommendAccept` or similar
- **THEN** this SHALL record the recommendation without changing the Submission status
- **AND** the Editor SHALL review the recommendation before making a final Decision

### Requirement: DecisionType enum
The system SHALL define a `DecisionType` enum with values: `Accept`, `Reject`, `RevisionsRequired`, `RecommendAccept`, `RecommendReject`, `RecommendRevisions`, `Withdraw`.

#### Scenario: Decision type values
- **WHEN** a Decision is created
- **THEN** the `decisionType` SHALL be one of the defined DecisionType enum values

### Requirement: Feedback entity
The system SHALL define a `Feedback` entity with the following attributes:
- `id`: string (UUID)
- `submissionId`: string (references Submission)
- `revisionId`: string (references Revision)
- `authorId`: string (references User — the reviewer or editor providing feedback)
- `content`: string
- `score`: number | null (numeric score, e.g., 1-5)
- `recommendation`: FeedbackRecommendation | null
- `createdAt`: Date
- `updatedAt`: Date

Feedback SHALL be created by users in Reviewer or Editor roles during stages that require feedback (Review, Editorial). Multiple Feedback entries MAY exist for a single Revision.

#### Scenario: Reviewer provides feedback
- **WHEN** a Reviewer creates Feedback on a Revision in the Review stage
- **THEN** the Feedback SHALL reference the Submission, Revision, and Reviewer
- **AND** the Feedback MAY include a numeric score and a recommendation

#### Scenario: Editorial feedback
- **WHEN** an Editor creates Feedback on a Revision in the Editorial stage
- **THEN** the Feedback SHALL be distinct from a Decision
- **AND** the Editor may later create a formal Decision based on collected Feedback

#### Scenario: Multiple feedbacks per revision
- **WHEN** multiple reviewers are assigned to a Revision
- **THEN** each reviewer SHALL be able to create their own Feedback entry
- **AND** all Feedback entries for the Revision SHALL reference the same submissionId and revisionId

### Requirement: FeedbackRecommendation enum
The system SHALL define a `FeedbackRecommendation` enum with values: `Accept`, `Reject`, `RevisionsNeeded`.

#### Scenario: Feedback recommendation options
- **WHEN** a reviewer provides a recommendation in their Feedback
- **THEN** the recommendation SHALL be one of Accept, Reject, or RevisionsNeeded

### Requirement: Publication entity
The system SHALL define a `Publication` entity with the following attributes:
- `id`: string (UUID)
- `issueId`: string (references Issue)
- `revisionId`: string (references the accepted final Revision)
- `submissionId`: string (references Submission)
- `doi`: string | null
- `publishedAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

A Publication SHALL point to the accepted final Revision. A Publication SHALL belong to exactly one Issue.

#### Scenario: Publishing an accepted submission
- **WHEN** a Submission is accepted and a Publication is created
- **THEN** the Publication SHALL reference the final accepted Revision
- **AND** the Publication SHALL be associated with an Issue

#### Scenario: Publication with DOI
- **WHEN** a Publication is created with a DOI
- **THEN** the DOI SHALL be stored as an optional identifier

### Requirement: Domain entity isolation
All domain entities, value objects, and enums SHALL have ZERO external dependencies. The domain layer SHALL NOT import from `infrastructure`, `application`, or `presentation` layers. Entities SHALL use plain TypeScript types with no framework-specific decorators.

#### Scenario: No infrastructure imports in domain
- **WHEN** a domain entity file is inspected
- **THEN** it SHALL NOT contain any imports from `infrastructure`, `application`, or `presentation` directories
- **AND** it SHALL NOT use any decorator from Inversify, Prisma, or other external frameworks

#### Scenario: Pure TypeScript types
- **WHEN** domain entities are compiled
- **THEN** they SHALL consist only of plain TypeScript classes, interfaces, and enums
- **AND** repository interfaces SHALL define method contracts without implementation details

### Requirement: Repository interfaces for each entity
The system SHALL define repository interfaces in `src/domain/repositories/` for: `IUserRepository`, `IJournalRepository`, `ISubmissionRepository`, `IRevisionRepository`, `IDecisionRepository`, `IFeedbackRepository`, `IPublicationRepository`, and `IIssueRepository`. Each interface SHALL define standard CRUD operations: `findById`, `findAll`, `create`, `update`, `delete`.

#### Scenario: Submission repository interface
- **WHEN** a use case needs to persist a Submission
- **THEN** it SHALL depend on `ISubmissionRepository` (interface) injected via Inversify
- **AND** it SHALL NOT depend on any concrete implementation

#### Scenario: Repository interface methods
- **WHEN** a repository interface is defined
- **THEN** it SHALL include at minimum: `findById(id: string)`, `findAll()`, `create(entity)`, `update(id: string, data)`, `delete(id: string)`
- **AND** it MAY include domain-specific query methods (e.g., `findByJournalId`, `findByAuthorId`)