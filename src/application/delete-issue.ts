import type { IssueRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Issue } from '@app/domain/entities';

export type DeleteIssueParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteIssue implements UseCase<Promise<Either<Issue, Error>>, DeleteIssueParams> {
  private readonly issueRepository: IssueRepository;

  public constructor(@inject(SYMBOLS.IssueRepository) issueRepository: IssueRepository) {
    this.issueRepository = issueRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Issue, Error>> {
    return await this.issueRepository.deleteIssue(id, abortSignal);
  }
}
