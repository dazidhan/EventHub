import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    verifyEmailSchema,
} from './auth.validator.js';

const router = Router();

router.post(
    '/register',
    validate(registerSchema),
    authController.register,
);

router.post(
    '/login',
    validate(loginSchema),
    authController.login,
);

router.post(
    '/refresh',
    validate(refreshTokenSchema),
    authController.refreshToken,
);

router.get(
    '/verify-email/:token',
    validate(verifyEmailSchema, 'params'),
    authController.verifyEmail,
);

router.post(
    '/logout',
    authenticate,
    authController.logout,
);

export default router;
