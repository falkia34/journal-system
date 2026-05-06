import type { DecisionRepository, AuthRepository } from '@app/domain/repositories';
import { Either, left, isRight } from 'effect/Either';
import { inject, injectable } from 'inversify';
import { SYMBOLS } from '@config';
import { UseCase } from '@app/application';
import { Decision } from '@app/domain/entities';

export type CreateDecisionParams = [
  decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
  abortSignal?: AbortSignal,
];

@injectable()
export class CreateDecision
  implements UseCase<Promise<Either<Decision, Error>>, CreateDecisionParams>
{
  private readonly decisionRepository: DecisionRepository;
  private readonly authRepository: AuthRepository;

  public constructor(
    @inject(SYMBOLS.DecisionRepository) decisionRepository: DecisionRepository,
    @inject(SYMBOLS.AuthRepository) authRepository: AuthRepository,
  ) {
    this.decisionRepository = decisionRepository;
    this.authRepository = authRepository;
  }

  public async execute(
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>,
    abortSignal?: AbortSignal,
  ): Promise<Either<Decision, Error>> {
    const accessTokenResult = await this.authRepository.getAccessToken();

    if (isRight(accessTokenResult)) {
      return await this.decisionRepository.createDecision(
        decision,
        abortSignal,
        accessTokenResult.right,
      );
    } else {
      return left(accessTokenResult.left);
    }
  }
}
