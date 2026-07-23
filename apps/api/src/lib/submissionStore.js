const submissions = [];

export function createSubmissionRecord(record) {
  const submission = {
    id: `S-${1000 + submissions.length + 1}`,
    createdAt: new Date().toISOString(),
    ...record
  };

  submissions.unshift(submission);
  return submission;
}

export function listSubmissionRecords() {
  return submissions;
}
