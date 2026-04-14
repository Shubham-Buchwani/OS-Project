import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as ctrl from './run.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listRuns);
router.get('/:id', ctrl.getRun);
router.patch('/:id', ctrl.updateRun);
router.delete('/:id', ctrl.deleteRun);
router.get('/:id/steps', ctrl.getRunSteps);

export default router;
