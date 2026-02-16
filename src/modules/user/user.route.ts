import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileSchema } from './user.validator.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getProfile);

router.patch(
    '/me',
    validate(updateProfileSchema),
    userController.updateProfile,
);

router.delete('/me', userController.deleteAccount);

export default router;
