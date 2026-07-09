import { z } from 'zod';

export const studentUpsertSchema = z.object({
  userId: z.string(),
  programmeId: z.string().optional(),
  studentNumber: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  bio: z.any().optional()
});
