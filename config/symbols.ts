export const SYMBOLS = {
  // Use cases
  CreateSubmission: Symbol.for('CreateSubmission'),
  GetSubmission: Symbol.for('GetSubmission'),
  GetSubmissions: Symbol.for('GetSubmissions'),
  CreateDecision: Symbol.for('CreateDecision'),
  CreateFeedback: Symbol.for('CreateFeedback'),
  SubmitRevision: Symbol.for('SubmitRevision'),
  GetRevision: Symbol.for('GetRevision'),
  GetRevisions: Symbol.for('GetRevisions'),
  GetUser: Symbol.for('GetUser'),
  GetUsers: Symbol.for('GetUsers'),
  CreateUser: Symbol.for('CreateUser'),
  Login: Symbol.for('Login'),
  Logout: Symbol.for('Logout'),
  GetSession: Symbol.for('GetSession'),

  // Repositories
  AuthRepository: Symbol.for('AuthRepository'),
  InternalRepository: Symbol.for('InternalRepository'),
  SubmissionRepository: Symbol.for('SubmissionRepository'),
  RevisionRepository: Symbol.for('RevisionRepository'),
  DecisionRepository: Symbol.for('DecisionRepository'),
  FeedbackRepository: Symbol.for('FeedbackRepository'),
  JournalRepository: Symbol.for('JournalRepository'),
  IssueRepository: Symbol.for('IssueRepository'),
  PublicationRepository: Symbol.for('PublicationRepository'),
  UserRepository: Symbol.for('UserRepository'),

  // Data sources
  LocalStorageDataSource: Symbol.for('LocalStorageDataSource'),
  SessionStorageDataSource: Symbol.for('SessionStorageDataSource'),
  AuthDataSource: Symbol.for('AuthDataSource'),
  JournalSystemDataSource: Symbol.for('JournalSystemDataSource'),
};
