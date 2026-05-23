# Entities

## Entity Relationship Diagram

```
User ──┬──< Submission (authorId)
       ├──< Decision (deciderId)
       ├──< Feedback (authorId)
       ├──< Participant (userId)
       └──< Journal (editorInChiefId)

Journal ──< Issue (journalId)
         └──< Submission (journalId)

Issue ──< Publication (issueId)

Submission ──< Revision (submissionId)
            ├──< Decision (submissionId)
            ├──< Feedback (submissionId)
            ├──< Participant (submissionId)
            └──< Publication (submissionId, unique)

Revision ──< Feedback (revisionId)
          ├──< Decision (revisionId, unique)
          └──< Publication (revisionId, unique)

File ──< Revision (fileId)
      └──< Feedback (fileId, optional)
```

## Entity Definitions

### User

| Field     | Type   | Notes                                                  |
| --------- | ------ | ------------------------------------------------------ |
| id        | UUID   | Primary key                                            |
| name      | string | Display name                                           |
| email     | string | Unique, used for auth                                  |
| roles     | Role[] | `Author`, `Reviewer`, `Editor`, `Administrator`        |
| createdAt | Date   |                                                        |
| updatedAt | Date   |                                                        |

**Filter options**: name, email, role
**Sort options**: createdAt, updatedAt, name, email

### Journal

| Field           | Type    | Notes                                |
| --------------- | ------- | ------------------------------------ |
| id              | UUID    | Primary key                          |
| name            | string  | Journal name                         |
| description     | string  |                                      |
| issn            | string? | International Standard Serial Number |
| editorInChiefId | UUID    | FK → User                            |
| createdAt       | Date    |                                      |
| updatedAt       | Date    |                                      |

**Include options**: editorInChief
**Filter options**: name, editorInChiefId
**Sort options**: createdAt, updatedAt, name

### Issue

| Field       | Type    | Notes                    |
| ----------- | ------- | ------------------------ |
| id          | UUID    | Primary key              |
| journalId   | UUID    | FK → Journal             |
| volume      | number  |                          |
| number      | number  |                          |
| title       | string? |                          |
| description | string? |                          |
| publishedAt | Date?   | Null = unpublished draft |
| createdAt   | Date    |                          |
| updatedAt   | Date    |                          |

**Include options**: journal, publications
**Filter options**: journalId, published
**Sort options**: createdAt, updatedAt, publishedAt, volume, number

### Submission

| Field     | Type             | Notes                   |
| --------- | ---------------- | ----------------------- |
| id        | UUID             | Primary key             |
| authorId  | UUID             | FK → User               |
| journalId | UUID             | FK → Journal            |
| title     | string           |                         |
| abstract  | string           |                         |
| authors   | Json             | Array of co-author info |
| status    | SubmissionStatus | Default: Draft          |
| createdAt | Date             |                         |
| updatedAt | Date             |                         |

**Include options**: author, journal
**Filter options**: journalId, authorId, status
**Sort options**: createdAt, updatedAt, title

### Revision

| Field        | Type          | Notes                             |
| ------------ | ------------- | --------------------------------- |
| id           | UUID          | Primary key                       |
| submissionId | UUID          | FK → Submission                   |
| fileId       | UUID          | FK → File                         |
| version      | number        | Unique per submission             |
| startStage   | RevisionStage | Stage when revision was created   |
| currentStage | RevisionStage | Current stage of this revision    |
| isFrozen     | boolean       | Frozen = no further modifications |
| createdAt    | Date          |                                   |
| updatedAt    | Date          |                                   |

**Include options**: submission, file, feedbacks, decision, publication
**Filter options**: submissionId, fileId, isFrozen, currentStage
**Sort options**: createdAt, updatedAt, version

### Decision

| Field        | Type          | Notes                  |
| ------------ | ------------- | ---------------------- |
| id           | UUID          | Primary key            |
| submissionId | UUID          | FK → Submission        |
| revisionId   | UUID          | FK → Revision (unique) |
| deciderId    | UUID          | FK → User              |
| startStage   | RevisionStage | Stage before decision  |
| decidedStage | RevisionStage | Stage after decision   |
| comment      | string?       | Editor's reasoning     |
| createdAt    | Date          |                        |
| updatedAt    | Date          |                        |

**Include options**: submission, revision, decider
**Filter options**: submissionId, revisionId, deciderId

### Feedback

| Field          | Type                   | Notes                                |
| -------------- | ---------------------- | ------------------------------------ |
| id             | UUID                   | Primary key                          |
| submissionId   | UUID                   | FK → Submission                      |
| revisionId     | UUID                   | FK → Revision                        |
| authorId       | UUID                   | FK → User (reviewer)                 |
| fileId         | UUID?                  | FK → File (optional annotated file)  |
| content        | string                 | Review content                       |
| stage          | FeedbackStage          | Which stage this feedback belongs to |
| recommendation | FeedbackRecommendation | Continue / Reject / Revise           |
| createdAt      | Date                   |                                      |
| updatedAt      | Date                   |                                      |

**Include options**: submission, revision, author, file
**Filter options**: submissionId, revisionId, authorId, recommendation

### Publication

| Field        | Type    | Notes                     |
| ------------ | ------- | ------------------------- |
| id           | UUID    | Primary key               |
| issueId      | UUID    | FK → Issue                |
| submissionId | UUID    | FK → Submission (unique)  |
| revisionId   | UUID    | FK → Revision (unique)    |
| doi          | string? | Digital Object Identifier |
| publishedAt  | Date    |                           |
| createdAt    | Date    |                           |
| updatedAt    | Date    |                           |

**Include options**: issue, submission, revision
**Filter options**: issueId, submissionId, revisionId

### Participant

| Field        | Type          | Notes                                  |
| ------------ | ------------- | -------------------------------------- |
| id           | UUID          | Primary key                            |
| submissionId | UUID          | FK → Submission                        |
| userId       | UUID          | FK → User                              |
| stage        | RevisionStage | Which stage participant is assigned to |
| createdAt    | Date          |                                        |
| updatedAt    | Date          |                                        |

**Include options**: submission, user
**Filter options**: submissionId, userId, stage

### File

| Field        | Type   | Notes                    |
| ------------ | ------ | ------------------------ |
| id           | UUID   | Primary key              |
| filename     | string | Stored filename          |
| originalName | string | User's original filename |
| mimeType     | string | MIME type                |
| size         | number | File size in bytes       |

**Filter options**: mimeType, filename
**Sort options**: filename, size

## Enums

### Role

`Author` | `Reviewer` | `Editor` | `Administrator`

### SubmissionStatus / RevisionStage

`Draft` | `Submitted` | `Review` | `Edit` | `CopyEdit` | `LayoutEdit` | `FinalReview` | `Published` | `Rejected` | `Withdrawn`

### FeedbackStage

`Review` | `Edit` | `CopyEdit` | `LayoutEdit` | `FinalReview`

### FeedbackRecommendation

`Continue` | `Reject` | `Revise`

## Submission Status State Machine

```
Draft ──→ Submitted ──→ Review ──→ Edit ──→ CopyEdit ──→ LayoutEdit ──→ FinalReview ──→ Published
  │          │            │          │
  │          │            └──→ Rejected
  │          │
  └──→ Withdrawn ←── (any stage)
```

- **Draft** → **Submitted**: Author submits
- **Submitted** → **Review**: Editor assigns reviewers
- **Review** → **Edit**: Reviewers recommend revisions
- **Edit** → **CopyEdit**: Author submits revised manuscript
- **CopyEdit** → **LayoutEdit**: Copyediting complete
- **LayoutEdit** → **FinalReview**: Layout complete
- **FinalReview** → **Published**: Editor approves
- Any stage → **Rejected**: Editor rejects
- Any stage → **Withdrawn**: Author withdraws
