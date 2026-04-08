import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { simulationRunLimiter } from '../../middleware/rateLimiter.js';
import { createSimulationSchema, updateSimulationSchema, runConfigSchema, paginationSchema } from '@os-sim/shared';
import * as ctrl from './simulation.controller.js';

const router = Router();

// All simulation routes require auth
router.use(authenticate);

router.get('/', validate(paginationSchema, 'query'), ctrl.listSimulations);
router.get('/:id', ctrl.getSimulation);
router.post('/', authorize('instructor', 'admin'), validate(createSimulationSchema), ctrl.createSimulation);
router.patch('/:id', authorize('instructor', 'admin'), validate(updateSimulationSchema), ctrl.updateSimulation);
router.delete('/:id', authorize('admin'), ctrl.deleteSimulation);
router.post('/:id/run', simulationRunLimiter, validate(runConfigSchema), ctrl.runSimulation);
router.get('/:id/runs', validate(paginationSchema, 'query'), ctrl.listRunsForSimulation);

export default router;
