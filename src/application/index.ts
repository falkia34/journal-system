export * from './create-submission';
export * from './get-submission';
export * from './get-submissions';
export * from './create-decision';
export * from './create-feedback';
export * from './submit-revision';
export * from './login';
export * from './logout';
export * from './get-session';

export abstract class UseCase<S, T extends unknown[] = []> {
  public abstract execute(...[param]: T): S;
}
