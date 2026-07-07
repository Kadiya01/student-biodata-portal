import { Submission } from '../api/mockDb';

export interface SaveBiodataPayload {
  biodata: any;
  action: 'save' | 'submit';
}

export interface IStudentRepository {
  getBiodata(): Promise<{ biodata: any; submission: Submission | null }>;
  saveBiodata(payload: SaveBiodataPayload): Promise<{ submission: Submission }>;
}
