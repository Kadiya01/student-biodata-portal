import { IAuthRepository } from './IAuthRepository';
import { IStudentRepository } from './IStudentRepository';
import { IAdminRepository } from './IAdminRepository';

const useMock = (import.meta as any).env.VITE_USE_MOCK === 'true';

let authRepo: IAuthRepository;
let studentRepo: IStudentRepository;
let adminRepo: IAdminRepository;

if (useMock) {
  const { MockAuthRepository } = await import('./mock/MockAuthRepository');
  const { MockStudentRepository } = await import('./mock/MockStudentRepository');
  const { MockAdminRepository } = await import('./mock/MockAdminRepository');
  authRepo = new MockAuthRepository();
  studentRepo = new MockStudentRepository();
  adminRepo = new MockAdminRepository();
} else {
  const { ApiAuthRepository } = await import('./api/ApiAuthRepository');
  const { ApiStudentRepository } = await import('./api/ApiStudentRepository');
  const { ApiAdminRepository } = await import('./api/ApiAdminRepository');
  authRepo = new ApiAuthRepository();
  studentRepo = new ApiStudentRepository();
  adminRepo = new ApiAdminRepository();
}

export { authRepo, studentRepo, adminRepo };
