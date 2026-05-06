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
} from '@app/infrastructure/repositories';
import { SYMBOLS } from '@config';
import {
  CreateSubmission,
  GetSubmission,
  GetSubmissions,
  CreateDecision,
  CreateFeedback,
  SubmitRevision,
} from '@app/application';
import {
  AuthServerDataSource,
  authServerDataSourceImpl,
  JournalSystemDataSource,
  JournalSystemDataSourceImpl,
} from '@app/infrastructure/datasources/server';

export const serverContainer = new Container();

serverContainer
  .bind<JournalSystemDataSource>(SYMBOLS.JournalSystemDataSource)
  .toConstantValue(JournalSystemDataSourceImpl);
serverContainer.bind<AuthServerDataSource>(SYMBOLS.AuthDataSource).toDynamicValue(() => {
  // const getUsers = serverContainer.get<GetUsersWithToken>(SYMBOLS.GetUsersWithToken);
  // const getUserPermissionsWithToken = serverContainer.get<GetUserPermissionsWithToken>(
  //   SYMBOLS.GetUserPermissionsWithToken,
  // );
  return authServerDataSourceImpl();
});

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

serverContainer.bind<CreateSubmission>(SYMBOLS.CreateSubmission).to(CreateSubmission);
serverContainer.bind<GetSubmission>(SYMBOLS.GetSubmission).to(GetSubmission);
serverContainer.bind<GetSubmissions>(SYMBOLS.GetSubmissions).to(GetSubmissions);
serverContainer.bind<CreateDecision>(SYMBOLS.CreateDecision).to(CreateDecision);
serverContainer.bind<CreateFeedback>(SYMBOLS.CreateFeedback).to(CreateFeedback);
serverContainer.bind<SubmitRevision>(SYMBOLS.SubmitRevision).to(SubmitRevision);
