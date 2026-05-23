import type { IssueRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Issue } from '@app/domain/entities';

export type CreateIssueParams = [
  issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateIssue implements UseCase<Promise<Either<Issue, Error>>, CreateIssueParams> {
  private readonly issueRepository: IssueRepository;

  public constructor(@inject(SYMBOLS.IssueRepository) issueRepository: IssueRepository) {
    this.issueRepository = issueRepository;
  }

  public async execute(
    issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Issue, Error>> {
    return await this.issueRepository.createIssue(issue, abortSignal);
  }
}
