import { GetSubmission, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { SubmissionDto, SubmissionMapper } from '@app/infrastructure/dtos';
import { SectionHeader, SubmissionStatusBadge } from '@app/presentation/components/internal/shared';
import { SubmissionToolbar } from '@app/presentation/components/internal/author/submissions';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';
import { SubmissionView as AdminSubmissionView } from '@app/presentation/components/internal/admin/submissions';
import { SubmissionView as EditorSubmissionView } from '@app/presentation/components/internal/editor/submissions';
import { SubmissionView as ReviewerSubmissionView } from '@app/presentation/components/internal/reviewer/submissions';
import {
  SubmissionView as AuthorSubmissionView,
  SubmissionForm,
} from '@app/presentation/components/internal/author/submissions';

type Role = 'ADMINISTRATOR' | 'EDITOR' | 'REVIEWER' | 'AUTHOR';

const SUBMISSION_COMPONENTS: Record<
  Role,
  {
    View: typeof AdminSubmissionView;
    Toolbar: React.ComponentType<{ submissionId: string; status?: string }> | null;
  }
> = {
  ADMINISTRATOR: { View: AdminSubmissionView, Toolbar: null },
  EDITOR: { View: EditorSubmissionView, Toolbar: null },
  REVIEWER: { View: ReviewerSubmissionView, Toolbar: null },
  AUTHOR: { View: AuthorSubmissionView, Toolbar: SubmissionToolbar },
};

type Props = {
  params: Promise<{ submissionId: string }>;
};

export default async function SingleSubmissionPage({ params }: Props) {
  const { submissionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const sessionResult = await getSession.execute();
  const session = match(sessionResult, {
    onLeft: (e) => {
      throw e;
    },
    onRight: (d) => d,
  });

  const role = session.activeRole as Role;

  if (submissionId === 'new' && ['AUTHOR'].includes(role)) {
    return <SubmissionForm />;
  } else if (submissionId !== 'new') {
    const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);

    const submissionResult = await getSubmission.execute(submissionId, ['journal', 'author']);
    const submission = match(submissionResult, {
      onLeft: (e) => {
        throw e;
      },
      onRight: (d) => d,
    });

    const { View, Toolbar } = SUBMISSION_COMPONENTS[role];

    return (
      <>
        <SectionHeader
          title={submission.title}
          badge={<SubmissionStatusBadge status={submission.status} />}
        >
          {Toolbar ? <Toolbar submissionId={submission.id} status={submission.status} /> : null}
        </SectionHeader>
        <View initialSubmission={SubmissionMapper.fromDomainToDto(submission) as SubmissionDto} />
      </>
    );
  } else {
    notFound();
  }
}
