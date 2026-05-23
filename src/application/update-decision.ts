import type { DecisionRepository } from '@app/domain/repositories';
import { Either } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Decision } from '@app/domain/entities';

export type UpdateDecisionParams = [
  id: string,
  decision: Partial<Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>>,
  abortSignal?: AbortSignal,
];

@injectable()
export class UpdateDecision
  implements UseCase<Promise<Either<Decision, Error>>, UpdateDecisionParams>
{
  private readonly decisionRepository: DecisionRepository;

  public constructor(@inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository) {
    this.decisionRepository = decisionRepository;
  }

  public async execute(
    id: string,
    decision: Partial<Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Decision, Error>> {
    return await this.decisionRepository.updateDecision(id, decision, abortSignal);
  }
}
