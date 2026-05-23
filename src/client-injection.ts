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
  InternalRepository,
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
  InternalRepositoryImpl,
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
  Login,
  Logout,
  GetSession,
  UpdateSession,
  GetSidebarExtendedState,
  SetSidebarExtendedState,
} from '@app/application';
import {
  AuthClientDataSource,
  authClientDataSourceImpl,
  LocalStorageDataSource,
  LocalStorageDataSourceImpl,
  SessionStorageDataSource,
  SessionStorageDataSourceImpl,
} from '@app/infrastructure/datasources/client';

export const clientContainer = new Container();

// Data Sources
clientContainer
  .bind<SessionStorageDataSource>(SYMBOLS.SessionStorageDataSource)
  .to(SessionStorageDataSourceImpl);
clientContainer
  .bind<LocalStorageDataSource>(SYMBOLS.LocalStorageDataSource)
  .to(LocalStorageDataSourceImpl);
clientContainer
  .bind<AuthClientDataSource>(SYMBOLS.AuthDataSource)
  .toConstantValue(authClientDataSourceImpl);

// Repositories
clientContainer.bind<InternalRepository>(SYMBOLS.InternalRepository).to(InternalRepositoryImpl);
clientContainer.bind<AuthRepository>(SYMBOLS.AuthRepository).to(AuthRepositoryImpl);
clientContainer
  .bind<SubmissionRepository>(SYMBOLS.SubmissionRepository)
  .to(SubmissionRepositoryImpl);
clientContainer.bind<RevisionRepository>(SYMBOLS.RevisionRepository).to(RevisionRepositoryImpl);
clientContainer.bind<DecisionRepository>(SYMBOLS.DecisionRepository).to(DecisionRepositoryImpl);
clientContainer.bind<FeedbackRepository>(SYMBOLS.FeedbackRepository).to(FeedbackRepositoryImpl);
clientContainer.bind<JournalRepository>(SYMBOLS.JournalRepository).to(JournalRepositoryImpl);
clientContainer.bind<IssueRepository>(SYMBOLS.IssueRepository).to(IssueRepositoryImpl);
clientContainer
  .bind<PublicationRepository>(SYMBOLS.PublicationRepository)
  .to(PublicationRepositoryImpl);
clientContainer.bind<UserRepository>(SYMBOLS.UserRepository).to(UserRepositoryImpl);
clientContainer
  .bind<ParticipantRepository>(SYMBOLS.ParticipantRepository)
  .to(ParticipantRepositoryImpl);

// Use Cases
clientContainer.bind<CreateSubmission>(SYMBOLS.CreateSubmission).to(CreateSubmission);
clientContainer.bind<GetSubmission>(SYMBOLS.GetSubmission).to(GetSubmission);
clientContainer.bind<GetSubmissions>(SYMBOLS.GetSubmissions).to(GetSubmissions);
clientContainer.bind<UpdateSubmission>(SYMBOLS.UpdateSubmission).to(UpdateSubmission);
clientContainer.bind<DeleteSubmission>(SYMBOLS.DeleteSubmission).to(DeleteSubmission);
clientContainer.bind<CreateDecision>(SYMBOLS.CreateDecision).to(CreateDecision);
clientContainer.bind<GetDecision>(SYMBOLS.GetDecision).to(GetDecision);
clientContainer.bind<GetDecisions>(SYMBOLS.GetDecisions).to(GetDecisions);
clientContainer.bind<UpdateDecision>(SYMBOLS.UpdateDecision).to(UpdateDecision);
clientContainer.bind<DeleteDecision>(SYMBOLS.DeleteDecision).to(DeleteDecision);
clientContainer.bind<CreateFeedback>(SYMBOLS.CreateFeedback).to(CreateFeedback);
clientContainer.bind<GetFeedback>(SYMBOLS.GetFeedback).to(GetFeedback);
clientContainer.bind<GetFeedbacks>(SYMBOLS.GetFeedbacks).to(GetFeedbacks);
clientContainer.bind<UpdateFeedback>(SYMBOLS.UpdateFeedback).to(UpdateFeedback);
clientContainer.bind<DeleteFeedback>(SYMBOLS.DeleteFeedback).to(DeleteFeedback);
clientContainer.bind<SubmitRevision>(SYMBOLS.SubmitRevision).to(SubmitRevision);
clientContainer.bind<GetRevision>(SYMBOLS.GetRevision).to(GetRevision);
clientContainer.bind<GetRevisions>(SYMBOLS.GetRevisions).to(GetRevisions);
clientContainer.bind<GetActiveRevision>(SYMBOLS.GetActiveRevision).to(GetActiveRevision);
clientContainer.bind<UpdateRevision>(SYMBOLS.UpdateRevision).to(UpdateRevision);
clientContainer.bind<DeleteRevision>(SYMBOLS.DeleteRevision).to(DeleteRevision);
clientContainer.bind<CreateJournal>(SYMBOLS.CreateJournal).to(CreateJournal);
clientContainer.bind<GetJournal>(SYMBOLS.GetJournal).to(GetJournal);
clientContainer.bind<GetJournals>(SYMBOLS.GetJournals).to(GetJournals);
clientContainer.bind<UpdateJournal>(SYMBOLS.UpdateJournal).to(UpdateJournal);
clientContainer.bind<DeleteJournal>(SYMBOLS.DeleteJournal).to(DeleteJournal);
clientContainer.bind<CreateIssue>(SYMBOLS.CreateIssue).to(CreateIssue);
clientContainer.bind<GetIssue>(SYMBOLS.GetIssue).to(GetIssue);
clientContainer.bind<GetIssues>(SYMBOLS.GetIssues).to(GetIssues);
clientContainer.bind<UpdateIssue>(SYMBOLS.UpdateIssue).to(UpdateIssue);
clientContainer.bind<DeleteIssue>(SYMBOLS.DeleteIssue).to(DeleteIssue);
clientContainer.bind<CreatePublication>(SYMBOLS.CreatePublication).to(CreatePublication);
clientContainer.bind<GetPublication>(SYMBOLS.GetPublication).to(GetPublication);
clientContainer.bind<GetPublications>(SYMBOLS.GetPublications).to(GetPublications);
clientContainer.bind<UpdatePublication>(SYMBOLS.UpdatePublication).to(UpdatePublication);
clientContainer.bind<DeletePublication>(SYMBOLS.DeletePublication).to(DeletePublication);
clientContainer.bind<CreateParticipant>(SYMBOLS.CreateParticipant).to(CreateParticipant);
clientContainer.bind<GetParticipant>(SYMBOLS.GetParticipant).to(GetParticipant);
clientContainer.bind<GetParticipants>(SYMBOLS.GetParticipants).to(GetParticipants);
clientContainer.bind<UpdateParticipant>(SYMBOLS.UpdateParticipant).to(UpdateParticipant);
clientContainer.bind<DeleteParticipant>(SYMBOLS.DeleteParticipant).to(DeleteParticipant);
clientContainer.bind<GetUser>(SYMBOLS.GetUser).to(GetUser);
clientContainer.bind<GetUsers>(SYMBOLS.GetUsers).to(GetUsers);
clientContainer.bind<CreateUser>(SYMBOLS.CreateUser).to(CreateUser);
clientContainer.bind<UpdateUser>(SYMBOLS.UpdateUser).to(UpdateUser);
clientContainer.bind<DeleteUser>(SYMBOLS.DeleteUser).to(DeleteUser);
clientContainer.bind<Login>(SYMBOLS.Login).to(Login);
clientContainer.bind<Logout>(SYMBOLS.Logout).to(Logout);
clientContainer.bind<GetSession>(SYMBOLS.GetSession).to(GetSession);
clientContainer.bind<UpdateSession>(SYMBOLS.UpdateSession).to(UpdateSession);
clientContainer
  .bind<GetSidebarExtendedState>(SYMBOLS.GetSidebarExtendedState)
  .to(GetSidebarExtendedState);
clientContainer
  .bind<SetSidebarExtendedState>(SYMBOLS.SetSidebarExtendedState)
  .to(SetSidebarExtendedState);
