import 'reflect-metadata';
import { Container } from 'inversify';
import {
  SubmissionRepository,
  RevisionRepository,
  DecisionRepository,
  FeedbackRepository,
  JournalRepository,
  IssueRepository,
  PublicationRepository,
  UserRepository,
  ParticipantRepository,
  AuthRepository,
} from '@app/domain/repositories';
import {
  SubmissionRepositoryImpl,
  RevisionRepositoryImpl,
  DecisionRepositoryImpl,
  FeedbackRepositoryImpl,
  JournalRepositoryImpl,
  IssueRepositoryImpl,
  PublicationRepositoryImpl,
  UserRepositoryImpl,
  ParticipantRepositoryImpl,
  AuthRepositoryImpl,
} from '@app/infrastructure/repositories';
import { SYMBOLS } from '@config';
import {
  CreateSubmission,
  GetSubmission,
  GetSubmissions,
  UpdateSubmission,
  DeleteSubmission,
  CreateDecision,
  GetDecision,
  GetDecisions,
  UpdateDecision,
  DeleteDecision,
  CreateFeedback,
  GetFeedback,
  GetFeedbacks,
  UpdateFeedback,
  DeleteFeedback,
  SubmitRevision,
  GetRevision,
  GetRevisions,
  GetActiveRevision,
  UpdateRevision,
  DeleteRevision,
  CreateJournal,
  GetJournal,
  GetJournals,
  UpdateJournal,
  DeleteJournal,
  CreateIssue,
  GetIssue,
  GetIssues,
  UpdateIssue,
  DeleteIssue,
  CreatePublication,
  GetPublication,
  GetPublications,
  UpdatePublication,
  DeletePublication,
  CreateParticipant,
  GetParticipant,
  GetParticipants,
  UpdateParticipant,
  DeleteParticipant,
  GetUser,
  GetUsers,
  CreateUser,
  UpdateUser,
  DeleteUser,
  GetSession,
  UpdateSession,
  Logout,
} from '@app/application';
import {
  AuthServerDataSource,
  authServerDataSourceImpl,
  JournalSystemDataSource,
  JournalSystemDataSourceImpl,
} from '@app/infrastructure/datasources/server';
import { AuthController, AuthControllerImpl } from '@app/presentation/controllers';

export const serverContainer = new Container();

// Data Sources
serverContainer
  .bind<JournalSystemDataSource>(SYMBOLS.JournalSystemDataSource)
  .toConstantValue(JournalSystemDataSourceImpl);
serverContainer.bind<AuthServerDataSource>(SYMBOLS.AuthDataSource).toDynamicValue(() => {
  const getUsers = serverContainer.get<GetUsers>(SYMBOLS.GetUsers);

  return authServerDataSourceImpl(getUsers);
});

// Controllers
serverContainer.bind<AuthController>(SYMBOLS.AuthController).to(AuthControllerImpl);

// Repositories
serverContainer.bind<AuthRepository>(SYMBOLS.AuthRepository).to(AuthRepositoryImpl);
serverContainer
  .bind<SubmissionRepository>(SYMBOLS.SubmissionRepository)
  .to(SubmissionRepositoryImpl);
serverContainer.bind<RevisionRepository>(SYMBOLS.RevisionRepository).to(RevisionRepositoryImpl);
serverContainer.bind<DecisionRepository>(SYMBOLS.DecisionRepository).to(DecisionRepositoryImpl);
serverContainer.bind<FeedbackRepository>(SYMBOLS.FeedbackRepository).to(FeedbackRepositoryImpl);
serverContainer.bind<JournalRepository>(SYMBOLS.JournalRepository).to(JournalRepositoryImpl);
serverContainer.bind<IssueRepository>(SYMBOLS.IssueRepository).to(IssueRepositoryImpl);
serverContainer
  .bind<PublicationRepository>(SYMBOLS.PublicationRepository)
  .to(PublicationRepositoryImpl);
serverContainer.bind<UserRepository>(SYMBOLS.UserRepository).to(UserRepositoryImpl);
serverContainer
  .bind<ParticipantRepository>(SYMBOLS.ParticipantRepository)
  .to(ParticipantRepositoryImpl);

// Use Cases
serverContainer.bind<CreateSubmission>(SYMBOLS.CreateSubmission).to(CreateSubmission);
serverContainer.bind<GetSubmission>(SYMBOLS.GetSubmission).to(GetSubmission);
serverContainer.bind<GetSubmissions>(SYMBOLS.GetSubmissions).to(GetSubmissions);
serverContainer.bind<UpdateSubmission>(SYMBOLS.UpdateSubmission).to(UpdateSubmission);
serverContainer.bind<DeleteSubmission>(SYMBOLS.DeleteSubmission).to(DeleteSubmission);
serverContainer.bind<CreateDecision>(SYMBOLS.CreateDecision).to(CreateDecision);
serverContainer.bind<GetDecision>(SYMBOLS.GetDecision).to(GetDecision);
serverContainer.bind<GetDecisions>(SYMBOLS.GetDecisions).to(GetDecisions);
serverContainer.bind<UpdateDecision>(SYMBOLS.UpdateDecision).to(UpdateDecision);
serverContainer.bind<DeleteDecision>(SYMBOLS.DeleteDecision).to(DeleteDecision);
serverContainer.bind<CreateFeedback>(SYMBOLS.CreateFeedback).to(CreateFeedback);
serverContainer.bind<GetFeedback>(SYMBOLS.GetFeedback).to(GetFeedback);
serverContainer.bind<GetFeedbacks>(SYMBOLS.GetFeedbacks).to(GetFeedbacks);
serverContainer.bind<UpdateFeedback>(SYMBOLS.UpdateFeedback).to(UpdateFeedback);
serverContainer.bind<DeleteFeedback>(SYMBOLS.DeleteFeedback).to(DeleteFeedback);
serverContainer.bind<SubmitRevision>(SYMBOLS.SubmitRevision).to(SubmitRevision);
serverContainer.bind<GetRevision>(SYMBOLS.GetRevision).to(GetRevision);
serverContainer.bind<GetRevisions>(SYMBOLS.GetRevisions).to(GetRevisions);
serverContainer.bind<GetActiveRevision>(SYMBOLS.GetActiveRevision).to(GetActiveRevision);
serverContainer.bind<UpdateRevision>(SYMBOLS.UpdateRevision).to(UpdateRevision);
serverContainer.bind<DeleteRevision>(SYMBOLS.DeleteRevision).to(DeleteRevision);
serverContainer.bind<CreateJournal>(SYMBOLS.CreateJournal).to(CreateJournal);
serverContainer.bind<GetJournal>(SYMBOLS.GetJournal).to(GetJournal);
serverContainer.bind<GetJournals>(SYMBOLS.GetJournals).to(GetJournals);
serverContainer.bind<UpdateJournal>(SYMBOLS.UpdateJournal).to(UpdateJournal);
serverContainer.bind<DeleteJournal>(SYMBOLS.DeleteJournal).to(DeleteJournal);
serverContainer.bind<CreateIssue>(SYMBOLS.CreateIssue).to(CreateIssue);
serverContainer.bind<GetIssue>(SYMBOLS.GetIssue).to(GetIssue);
serverContainer.bind<GetIssues>(SYMBOLS.GetIssues).to(GetIssues);
serverContainer.bind<UpdateIssue>(SYMBOLS.UpdateIssue).to(UpdateIssue);
serverContainer.bind<DeleteIssue>(SYMBOLS.DeleteIssue).to(DeleteIssue);
serverContainer.bind<CreatePublication>(SYMBOLS.CreatePublication).to(CreatePublication);
serverContainer.bind<GetPublication>(SYMBOLS.GetPublication).to(GetPublication);
serverContainer.bind<GetPublications>(SYMBOLS.GetPublications).to(GetPublications);
serverContainer.bind<UpdatePublication>(SYMBOLS.UpdatePublication).to(UpdatePublication);
serverContainer.bind<DeletePublication>(SYMBOLS.DeletePublication).to(DeletePublication);
serverContainer.bind<CreateParticipant>(SYMBOLS.CreateParticipant).to(CreateParticipant);
serverContainer.bind<GetParticipant>(SYMBOLS.GetParticipant).to(GetParticipant);
serverContainer.bind<GetParticipants>(SYMBOLS.GetParticipants).to(GetParticipants);
serverContainer.bind<UpdateParticipant>(SYMBOLS.UpdateParticipant).to(UpdateParticipant);
serverContainer.bind<DeleteParticipant>(SYMBOLS.DeleteParticipant).to(DeleteParticipant);
serverContainer.bind<GetUser>(SYMBOLS.GetUser).to(GetUser);
serverContainer.bind<GetUsers>(SYMBOLS.GetUsers).to(GetUsers);
serverContainer.bind<CreateUser>(SYMBOLS.CreateUser).to(CreateUser);
serverContainer.bind<UpdateUser>(SYMBOLS.UpdateUser).to(UpdateUser);
serverContainer.bind<DeleteUser>(SYMBOLS.DeleteUser).to(DeleteUser);
serverContainer.bind<GetSession>(SYMBOLS.GetSession).to(GetSession);
serverContainer.bind<UpdateSession>(SYMBOLS.UpdateSession).to(UpdateSession);
serverContainer.bind<Logout>(SYMBOLS.Logout).to(Logout);
