import type { IssueRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Issue } from '@app/domain/entities';

export type UpdateIssueParams = [
  id: string,
  issue: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateIssue implements UseCase<Promise<Either<Issue, Error>>, UpdateIssueParams> {
  private readonly issueRepository: IssueRepository;

  public constructor(@inject(SYMBOLS.IssueRepository) issueRepository: IssueRepository) {
    this.issueRepository = issueRepository;
  }

  public async execute(
    id: string,
    issue: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Issue, Error>> {
    return await this.issueRepository.updateIssue(id, issue, abortSignal);
  }
}
