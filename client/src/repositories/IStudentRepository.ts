import { Submission } from '../api/mockDb';

export interface SaveBiodataPayload {
  biodata: any;
  action: 'save' | 'submit';
}

export interface DocumentEntry {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadedAt: string;
}

export interface IStudentRepository {
  getBiodata(): Promise<{ biodata: any; submission: Submission | null }>;
  saveBiodata(payload: SaveBiodataPayload): Promise<{ submission: Submission }>;
  getDocuments(): Promise<{ documents: DocumentEntry[] }>;
  uploadDocument(formData: FormData): Promise<{ document: DocumentEntry }>;
}
