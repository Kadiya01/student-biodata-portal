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
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
  bio: z.any().optional()
}).passthrough();
