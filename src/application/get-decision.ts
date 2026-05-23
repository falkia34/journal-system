import type { DecisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Decision, DecisionIncludeOptions } from '@app/domain/entities';

export type GetDecisionParams = [
  id: string,
  includeOptions?: DecisionIncludeOptions,
  abortSignal?: AbortSignal,
];

@injectable()
export class GetDecision implements UseCase<Promise<Either<Decision, Error>>, GetDecisionParams> {
  private readonly decisionRepository: DecisionRepository;

  public constructor(@inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository) {
    this.decisionRepository = decisionRepository;
  }

  public async execute(
    id: string,
    includeOptions?: DecisionIncludeOptions,
    abortSignal?: AbortSignal,
  ): Promise<Either<Decision, Error>> {
    return await this.decisionRepository.getDecision(id, includeOptions, abortSignal);
  }
}
