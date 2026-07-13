import api from '../../api/api';
import { IStudentRepository, SaveBiodataPayload, DocumentEntry } from '../IStudentRepository';
import { mapSubmission } from '../../api/mappers';

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

export class ApiStudentRepository implements IStudentRepository {
  async getBiodata(): Promise<{ biodata: any; submission: any }> {
    const userId = getUserIdFromToken();
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      throw err;
    }
    const res = await api.get(`/students/by-user/${userId}`);
    const student = res.data.student;
    return {
      biodata: student?.bio || null,
      submission: mapSubmission(student),
    };
  }

  async saveBiodata(payload: SaveBiodataPayload): Promise<{ submission: any }> {
    const userId = getUserIdFromToken();
    const isSubmitting = payload.action === 'submit';
    const data = {
      ...payload.biodata,
      userId,
      status: isSubmitting ? 'submitted' : 'draft',
    };
    const res = await api.post('/students', data);
    return { submission: mapSubmission(res.data.profile) };
  }

  async getDocuments(): Promise<{ documents: DocumentEntry[] }> {
    const userId = getUserIdFromToken();
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      throw err;
    }
    const profileRes = await api.get(`/students/by-user/${userId}`);
    const studentId = profileRes.data.student?.id;
    if (!studentId) return { documents: [] };
    const res = await api.get(`/documents/${studentId}`);
    return { documents: res.data.docs || [] };
  }

  async uploadDocument(formData: FormData): Promise<{ document: DocumentEntry }> {
    const userId = getUserIdFromToken();
    if (!userId) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      throw err;
    }
    const profileRes = await api.get(`/students/by-user/${userId}`);
    const studentId = profileRes.data.student?.id;
    if (studentId) formData.append('studentId', studentId);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { document: res.data.doc };
  }
}
