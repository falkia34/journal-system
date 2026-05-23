import { GetSubmission, GetSession } from '@app/application';
import { match } from 'effect/Either';
import { SubmissionDto, SubmissionMapper } from '@app/infrastructure/dtos';
import { SubmissionForm } from '@app/presentation/components/internal/author/submissions';
import { serverContainer } from '@app/server-injection';
import { SYMBOLS } from '@config';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ submissionId: string }>;
};

export default async function EditSubmissionPage({ params }: Props) {
  const { submissionId } = await params;

  const getSession = serverContainer.get<GetSession>(SYMBOLS.GetSession);
  const getSubmission = serverContainer.get<GetSubmission>(SYMBOLS.GetSubmission);

  const [sessionResult, submissionResult] = await Promise.all([
    getSession.execute(),
    getSubmission.execute(submissionId, ['journal', 'author']),
  ]);

  const session = match(sessionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  const submission = match(submissionResult, {
    onLeft: (error) => {
      throw error;
    },
    onRight: (data) => data,
  });

  if (session.activeRole === 'AUTHOR' && submission.authorId === session.user.id) {
    return (
      <SubmissionForm
        initialSubmission={SubmissionMapper.fromDomainToDto(submission) as SubmissionDto}
      />
    );
  } else {
    notFound();
  }
}
