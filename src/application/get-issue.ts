import type { IssueRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Issue, IssueIncludeOptions } from '@app/domain/entities';

export type GetIssueParams = [
  id: string,
  includeOptions?: IssueIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetIssue implements UseCase<Promise<Either<Issue, Error>>, GetIssueParams> {
  private readonly issueRepository: IssueRepository;

  public constructor(@inject(SYMBOLS.IssueRepository) issueRepository: IssueRepository) {
    this.issueRepository = issueRepository;
  }

  public async execute(
    id: string,
    includeOptions?: IssueIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Issue, Error>> {
    return await this.issueRepository.getIssue(id, includeOptions, abortSignal);
  }
}
