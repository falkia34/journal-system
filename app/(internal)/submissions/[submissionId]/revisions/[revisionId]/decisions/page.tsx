import { GetRevision } from '@app/application';
import { match } from 'effect/Either';
import { SectionHeader } from '@app/presentation/components/internal/shared';
import { DecisionsList } from '@app/presentation/components/internal/shared/decisions';
import { DecisionDto, DecisionMapper } from '@app/infrastructure/dtos';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';

type Props = {
  params: Promise<{ submissionId: string; revisionId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function DecisionsPage({ params }: Props) {
  const { revisionId } = await params;

  const getRevision = serverContainer.get<GetRevision>(SYMBOLS.GetRevision);
  const revisionResult = await getRevision.execute(revisionId, ['decisions']);
  const revision = match(revisionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const decisions = revision.decisions ?? [];

  return (
    <>
      <SectionHeader title={`Decisions — Revision v${revision.version}`} />
      <DecisionsList
        initialDecisions={decisions.map(DecisionMapper.fromDomainToDto) as DecisionDto[]}
      />
    </>
  );
}
