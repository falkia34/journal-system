import type { DecisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Decision } from '@app/domain/entities';

export type DeleteDecisionParams = [id: string, abortSignal?: AbortSignal];

@injectable()
export class DeleteDecision
  implements UseCase<Promise<Either<Decision, Error>>, DeleteDecisionParams>
{
  private readonly decisionRepository: DecisionRepository;

  public constructor(@inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository) {
    this.decisionRepository = decisionRepository;
  }

  public async execute(id: string, abortSignal?: AbortSignal): Promise<Either<Decision, Error>> {
    return await this.decisionRepository.deleteDecision(id, abortSignal);
  }
}
