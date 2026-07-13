const STATUS_MAP: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_REVERSE: Record<string, string> = {
  Draft: 'draft',
  Submitted: 'submitted',
  'Under Review': 'under_review',
  Approved: 'approved',
  Rejected: 'rejected',
};

export function normalizeStatus(status: string | undefined): string {
  return STATUS_MAP[status || 'draft'] || 'Draft';
}

export function toDbStatus(status: string): string {
  return STATUS_REVERSE[status] || 'draft';
}

export function mapSubmission(sub: any): any {
  if (!sub) return null;
  const bio = sub.bio || {};
  const user = sub.user || {};
  const programme = sub.programme || {};
  return {
    id: sub.id,
    studentId: sub.userId,
    regNumber: sub.studentNumber,
    fullName: bio.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: bio.email || user.email || '',
    programme: typeof programme === 'string' ? programme : (programme.name || ''),
    submissionDate: sub.createdAt,
    status: normalizeStatus(sub.status),
    biodata: {
      ...bio,
      dob: bio.dob || sub.dob || '',
      gender: bio.gender || sub.gender || '',
      phone: bio.phone || sub.contactPhone || '',
      address: bio.address || sub.address || '',
    },
    reviewerComments: sub.reviewerComments || undefined,
  };
}
