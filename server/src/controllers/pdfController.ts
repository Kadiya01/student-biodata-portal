import { Request, Response } from 'express';
import { generateStudentPdf } from '../services/pdfService';
import { catchAsync } from '../middleware/catchAsync';
import logger from '../utils/logger';

export const downloadPdf = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await generateStudentPdf(id, res);
  } catch (err) {
    logger.error('PDF generation failed', { error: err, studentId: id });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
});
