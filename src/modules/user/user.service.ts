import { AuthRepository } from '../auth/auth.repository.js';
import type { UpdateProfileDto } from './user.validator.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export class UserService {
    private readonly userRepo: AuthRepository;

    constructor() {
        this.userRepo = new AuthRepository();
    }

    async getProfile(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }
        return user;
    }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        // Check if email is being changed and already exists
        if (data.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing && existing._id.toString() !== userId) {
                throw new ConflictError('Email already in use');
            }
        }

        const user = await this.userRepo.updateProfile(userId, data);
        if (!user) {
            throw new NotFoundError('User');
        }
        return user;
    }

    async softDeleteUser(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }
        await this.userRepo.softDelete(userId);
    }
}
