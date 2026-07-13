import { IStudentRepository, SaveBiodataPayload, DocumentEntry } from '../IStudentRepository';
import { getDbUsers, getDbSubmissions, saveDbSubmissions, getDbNotifications, saveDbNotifications, User, Submission } from '../../api/mockDb';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockDocs: DocumentEntry[] = [];

function getCurrentUserFromToken(): User | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const users = getDbUsers();
  return users.find((u) => u.email === token) || null;
}

export class MockStudentRepository implements IStudentRepository {
  async getBiodata(): Promise<{ biodata: any; submission: Submission | null }> {
    await delay(300);
    const currentUser = getCurrentUserFromToken();
    if (!currentUser || currentUser.role !== 'student') {
      const err: any = new Error('Forbidden');
      err.response = { status: 403, data: { message: 'Forbidden' } };
      throw err;
    }
    const submissions = getDbSubmissions();
    const submission = submissions.find((s) => s.studentId === currentUser.id);
    return {
      biodata: submission ? submission.biodata : null,
      submission: submission || null,
    };
  }

  async saveBiodata(payload: SaveBiodataPayload): Promise<{ submission: Submission }> {
    await delay(400);
    const currentUser = getCurrentUserFromToken();
    if (!currentUser) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      throw err;
    }

    const { biodata, action } = payload;
    const submissions = getDbSubmissions();
    const subIndex = submissions.findIndex((s) => s.studentId === currentUser.id);

    if (subIndex === -1) {
      const err: any = new Error('Submission not found');
      err.response = { status: 404, data: { message: 'Draft not found' } };
      throw err;
    }

    const currentSub = submissions[subIndex];
    const isSubmitting = action === 'submit';

    const updatedSub: Submission = {
      ...currentSub,
      submissionDate: new Date().toISOString(),
      status: isSubmitting ? 'Submitted' : 'Draft',
      biodata: {
        ...biodata,
        lastUpdated: new Date().toISOString(),
      },
    };

    submissions[subIndex] = updatedSub;
    saveDbSubmissions(submissions);

    if (isSubmitting) {
      const notifications = getDbNotifications();
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'New Biodata Submitted',
        message: `${updatedSub.fullName} (${updatedSub.regNumber}) submitted their biodata for review.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      saveDbNotifications(notifications);
    }

    return { submission: updatedSub };
  }

  async getDocuments(): Promise<{ documents: DocumentEntry[] }> {
    await delay(200);
    return { documents: mockDocs };
  }

  async uploadDocument(formData: FormData): Promise<{ document: DocumentEntry }> {
    await delay(500);
    const file = formData.get('document') as File;
    const doc: DocumentEntry = {
      id: `doc-${Date.now()}`,
      fileName: file?.name || 'untitled.pdf',
      fileType: file?.type || 'application/pdf',
      fileSize: file?.size || 0,
      category: (formData.get('category') as string) || 'general',
      uploadedAt: new Date().toISOString(),
    };
    mockDocs.unshift(doc);
    return { document: doc };
  }
}
