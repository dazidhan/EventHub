import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository.js';
import type { RegisterDto, LoginDto, RefreshTokenDto } from './auth.validator.js';
import { env } from '../../config/env.js';
import { createModuleLogger } from '../../config/logger.js';
import {
    ConflictError,
    UnauthorizedError,
    NotFoundError,
} from '../../utils/errors.js';
import type { JwtPayload, JwtTokenPair } from '../../interfaces/common.js';

const logger = createModuleLogger('auth-service');

export class AuthService {
    private readonly authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    // ─── Register ────────────────────────────────────────
    async register(data: RegisterDto) {
        const existing = await this.authRepository.findByEmail(data.email);
        if (existing) {
            throw new ConflictError('Email already registered');
        }

        // Generate mock verification token
        const verificationToken = uuidv4();

        const user = await this.authRepository.create({
            ...data,
            verificationToken,
        } as RegisterDto & { verificationToken: string });

        // Mock email service
        if (env.MOCK_EMAIL_ENABLED) {
            logger.info(
                { to: data.email, token: verificationToken },
                '📧 [MOCK] Verification email sent',
            );
        }

        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            message: 'Registration successful. Please verify your email.',
        };
    }

    // ─── Login ───────────────────────────────────────────
    async login(data: LoginDto): Promise<{ user: object; tokens: JwtTokenPair }> {
        const user = await this.authRepository.findByEmailWithPassword(data.email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(data.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const tokens = this.generateTokenPair({
            userId: user._id.toString(),
            role: user.role,
        });

        // Store refresh token
        await this.authRepository.updateRefreshToken(
            user._id.toString(),
            tokens.refreshToken,
        );

        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            tokens,
        };
    }

    // ─── Refresh Token ──────────────────────────────────
    async refreshToken(
        data: RefreshTokenDto,
    ): Promise<{ tokens: JwtTokenPair }> {
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(
                data.refreshToken,
                env.JWT_REFRESH_SECRET,
            ) as JwtPayload;
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const user = await this.authRepository.findByIdWithRefreshToken(
            decoded.userId,
        );
        if (!user || user.refreshToken !== data.refreshToken) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        const tokens = this.generateTokenPair({
            userId: user._id.toString(),
            role: user.role,
        });

        await this.authRepository.updateRefreshToken(
            user._id.toString(),
            tokens.refreshToken,
        );

        return { tokens };
    }

    // ─── Verify Email ───────────────────────────────────
    async verifyEmail(token: string): Promise<void> {
        const user = await this.authRepository.findByVerificationToken(token);
        if (!user) {
            throw new NotFoundError('Invalid verification token');
        }

        await this.authRepository.verifyEmail(user._id.toString());
        logger.info({ userId: user._id }, 'Email verified successfully');
    }

    // ─── Logout ─────────────────────────────────────────
    async logout(userId: string): Promise<void> {
        await this.authRepository.updateRefreshToken(userId, null);
    }

    // ─── Helpers ────────────────────────────────────────
    private generateTokenPair(payload: JwtPayload): JwtTokenPair {
        const tokenPayload = { ...payload };
        const accessOpts: SignOptions = {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
        };
        const refreshOpts: SignOptions = {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
        };
        const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, accessOpts);
        const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, refreshOpts);
        return { accessToken, refreshToken };
    }
}
