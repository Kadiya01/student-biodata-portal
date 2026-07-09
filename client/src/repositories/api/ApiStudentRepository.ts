import axios from 'axios';
import { IStudentRepository, SaveBiodataPayload } from '../IStudentRepository';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1',
});

function setAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

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
    setAuth();
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
      submission: student || null,
    };
  }

  async saveBiodata(payload: SaveBiodataPayload): Promise<{ submission: any }> {
    setAuth();
    const userId = getUserIdFromToken();
    const isSubmitting = payload.action === 'submit';
    const data = {
      ...payload.biodata,
      userId,
      status: isSubmitting ? 'submitted' : 'draft',
    };
    const res = await api.post('/students', data);
    return { submission: res.data.profile };
  }
}
