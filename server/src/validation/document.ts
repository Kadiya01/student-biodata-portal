import { z } from 'zod';

export const documentUploadSchema = z.object({
  studentId: z.string().uuid()
});
