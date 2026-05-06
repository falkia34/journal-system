## 1. Define Enums and Value Objects

- [x] 1.1 Create `src/domain/entities/enums/role.enum.ts` with Role enum (Author, Reviewer, Editor, Administrator)
- [x] 1.2 Create `src/domain/entities/enums/submission-status.enum.ts` with SubmissionStatus enum (Draft, Submitted, UnderReview, RevisionsRequested, RevisionsSubmitted, Accepted, Rejected, Withdrawn)
- [x] 1.3 Create `src/domain/entities/enums/revision-stage.enum.ts` with RevisionStage enum (Draft, Submission, Review, Editorial, Production, Published)
- [x] 1.4 Create `src/domain/entities/enums/decision-type.enum.ts` with DecisionType enum (Accept, Reject, RevisionsRequired, RecommendAccept, RecommendReject, RecommendRevisions, Withdraw)
- [x] 1.5 Create `src/domain/entities/enums/feedback-recommendation.enum.ts` with FeedbackRecommendation enum (Accept, Reject, RevisionsNeeded)
- [x] 1.6 Create `src/domain/entities/enums/index.ts` barrel export
- [x] 1.7 Create `src/domain/entities/value-objects/revision-file.vo.ts` with RevisionFile value object (filename, originalName, mimeType, size)

## 2. Define Domain Entities

- [x] 2.1 Create `src/domain/entities/user.entity.ts` with User entity (id, email, name, roles, avatarUrl, createdAt, updatedAt)
- [x] 2.2 Create `src/domain/entities/journal.entity.ts` with Journal entity (id, name, description, issn, editorInChiefId, createdAt, updatedAt)
- [x] 2.3 Create `src/domain/entities/issue.entity.ts` with Issue entity (id, journalId, volume, number, title, description, publishedAt, createdAt, updatedAt)
- [x] 2.4 Create `src/domain/entities/submission.entity.ts` with Submission entity (id, journalId, authorId, title, abstract, status, createdAt, updatedAt)
- [x] 2.5 Create `src/domain/entities/revision.entity.ts` with Revision entity (id, submissionId, version, startStage, currentStage, isFrozen, files, createdAt, updatedAt)
- [x] 2.6 Create `src/domain/entities/decision.entity.ts` with Decision entity (id, submissionId, revisionId, deciderId, stage, decisionType, comment, createdAt, updatedAt)
- [x] 2.7 Create `src/domain/entities/feedback.entity.ts` with Feedback entity (id, submissionId, revisionId, authorId, content, score, recommendation, createdAt, updatedAt)
- [x] 2.8 Create `src/domain/entities/publication.entity.ts` with Publication entity (id, issueId, revisionId, submissionId, doi, publishedAt, createdAt, updatedAt)
- [x] 2.9 Update `src/domain/entities/index.ts` barrel export to export all new entities, enums, and value objects; remove old Article/Review entity references

## 3. Define Repository Interfaces

- [x] 3.1 Delete old repository files: `article.repository.ts`, `review.repository.ts`
- [x] 3.2 Create `src/domain/repositories/user.repository.ts` with IUserRepository interface
- [x] 3.3 Create `src/domain/repositories/journal.repository.ts` with IJournalRepository interface
- [x] 3.4 Create `src/domain/repositories/submission.repository.ts` with ISubmissionRepository interface
- [x] 3.5 Create `src/domain/repositories/revision.repository.ts` with IRevisionRepository interface
- [x] 3.6 Create `src/domain/repositories/decision.repository.ts` with IDecisionRepository interface
- [x] 3.7 Create `src/domain/repositories/feedback.repository.ts` with IFeedbackRepository interface
- [x] 3.8 Create `src/domain/repositories/publication.repository.ts` with IPublicationRepository interface
- [x] 3.9 Create `src/domain/repositories/issue.repository.ts` with IIssueRepository interface
- [x] 3.10 Update `src/domain/repositories/index.ts` with `export type` for all repository interfaces

## 4. Define Domain Errors

- [x] 4.1 Update `src/domain/errors/` to add domain-specific error types (FrozenRevisionError, InvalidStageTransitionError)

## 5. Update Domain Barrel Export

- [x] 5.1 Update `src/domain/index.ts` to properly export all entities (as types), enums, value objects, error types, and repository interfaces (using `export type`)

## 6. Update DI Symbols

- [x] 6.1 Update `config/symbols.ts` to add DI symbols for new repositories (SubmissionRepository, RevisionRepository, DecisionRepository, FeedbackRepository, PublicationRepository, IssueRepository) and remove old ones (ArticleRepository, ReviewRepository)

## 7. Verify Build

- [x] 7.1 Run `npm run build` to ensure TypeScript compiles with no errors
- [x] 7.2 Verify that all domain entities have zero external dependencies (no Inversify, Prisma, or other framework imports)