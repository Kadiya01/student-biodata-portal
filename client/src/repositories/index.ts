import { IAuthRepository } from './IAuthRepository';
import { IStudentRepository } from './IStudentRepository';
import { IAdminRepository } from './IAdminRepository';
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockStudentRepository } from './mock/MockStudentRepository';
import { MockAdminRepository } from './mock/MockAdminRepository';
import { ApiAuthRepository } from './api/ApiAuthRepository';
import { ApiStudentRepository } from './api/ApiStudentRepository';
import { ApiAdminRepository } from './api/ApiAdminRepository';

const useMock = (import.meta as any).env.VITE_USE_MOCK !== 'false';

export const authRepo: IAuthRepository = useMock ? new MockAuthRepository() : new ApiAuthRepository();
export const studentRepo: IStudentRepository = useMock ? new MockStudentRepository() : new ApiStudentRepository();
export const adminRepo: IAdminRepository = useMock ? new MockAdminRepository() : new ApiAdminRepository();
