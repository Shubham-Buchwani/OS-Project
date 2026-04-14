import { z } from 'zod';
import { asyncHandler } from '../../utils/ApiError.js';
import * as runService from './run.service.js';

const updateRunSchema = z.object({
  userNotes: z.string().max(2000).optional(),
  isSaved: z.boolean().optional(),
});

export const listRuns = asyncHandler(async (req, res) => {
  const result = await runService.listRuns(req.user.id, req.query);
  res.json(result);
});

export const getRun = asyncHandler(async (req, res) => {
  const run = await runService.getRun(req.params.id, req.user.id);
  res.json({ data: run });
});

export const updateRun = asyncHandler(async (req, res) => {
  const dto = updateRunSchema.parse(req.body);
  const run = await runService.updateRun(req.params.id, req.user.id, dto);
  res.json({ data: run });
});

export const deleteRun = asyncHandler(async (req, res) => {
  await runService.deleteRun(req.params.id, req.user.id);
  res.status(204).send();
});

export const getRunSteps = asyncHandler(async (req, res) => {
  const result = await runService.getRunSteps(req.params.id, req.user.id, req.query);
  res.json(result);
});
