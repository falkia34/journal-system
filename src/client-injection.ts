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
  Login,
  Logout,
} from '@app/application';
import {
  AuthClientDataSource,
  authClientDataSourceImpl,
} from './infrastructure/datasources/client';

export const clientContainer = new Container();

clientContainer
  .bind<AuthClientDataSource>(SYMBOLS.AuthDataSource)
  .toConstantValue(authClientDataSourceImpl);

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

clientContainer.bind<CreateSubmission>(SYMBOLS.CreateSubmission).to(CreateSubmission);
clientContainer.bind<GetSubmission>(SYMBOLS.GetSubmission).to(GetSubmission);
clientContainer.bind<GetSubmissions>(SYMBOLS.GetSubmissions).to(GetSubmissions);
clientContainer.bind<CreateDecision>(SYMBOLS.CreateDecision).to(CreateDecision);
clientContainer.bind<CreateFeedback>(SYMBOLS.CreateFeedback).to(CreateFeedback);
clientContainer.bind<SubmitRevision>(SYMBOLS.SubmitRevision).to(SubmitRevision);
clientContainer.bind<Login>(SYMBOLS.Login).to(Login);
clientContainer.bind<Logout>(SYMBOLS.Logout).to(Logout);
