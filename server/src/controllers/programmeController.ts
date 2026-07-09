import { Request, Response } from 'express';
import * as programmeService from '../services/programmeService';
import { catchAsync } from '../middleware/catchAsync';

export const listProgrammes = catchAsync(async (req: Request, res: Response) => {
  const { departmentId } = req.query as any;
  const programmes = await programmeService.listProgrammes(departmentId);
  res.json({ programmes });
});

export const getProgramme = catchAsync(async (req: Request, res: Response) => {
  const programme = await programmeService.getProgramme(req.params.id);
  if (!programme) return res.status(404).json({ error: 'Not found' });
  res.json({ programme });
});

export const createProgramme = catchAsync(async (req: Request, res: Response) => {
  const programme = await programmeService.createProgramme(req.body);
  res.status(201).json({ programme });
});

export const updateProgramme = catchAsync(async (req: Request, res: Response) => {
  const programme = await programmeService.updateProgramme(req.params.id, req.body);
  res.json({ programme });
});

export const deleteProgramme = catchAsync(async (req: Request, res: Response) => {
  await programmeService.deleteProgramme(req.params.id);
  res.json({ success: true });
});

export const listDepartments = catchAsync(async (_req: Request, res: Response) => {
  const departments = await programmeService.listDepartments();
  res.json({ departments });
});
