import { asyncHandler } from '../../utils/ApiError.js';
import * as simService from './simulation.service.js';

export const listSimulations = asyncHandler(async (req, res) => {
  const result = await simService.listSimulations(req.query);
  res.json(result);
});

export const getSimulation = asyncHandler(async (req, res) => {
  const sim = await simService.getSimulation(req.params.id);
  res.json({ data: sim });
});

export const createSimulation = asyncHandler(async (req, res) => {
  const sim = await simService.createSimulation(req.body, req.user.id);
  res.status(201).json({ data: sim });
});

export const updateSimulation = asyncHandler(async (req, res) => {
  const sim = await simService.updateSimulation(req.params.id, req.body, req.user.id);
  res.json({ data: sim });
});

export const deleteSimulation = asyncHandler(async (req, res) => {
  await simService.deleteSimulation(req.params.id, req.user.id);
  res.status(204).send();
});

export const runSimulation = asyncHandler(async (req, res) => {
  const run = await simService.runSimulation(req.params.id, req.body.config, req.user.id);
  res.status(201).json({ data: run });
});

export const listRunsForSimulation = asyncHandler(async (req, res) => {
  const result = await simService.listRunsForSimulation(req.params.id, req.user.id, req.query);
  res.json(result);
});
