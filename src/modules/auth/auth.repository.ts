import { User, type IUserDocument } from './auth.model.js';
import type { RegisterDto } from './auth.validator.js';

export class AuthRepository {
    async findByEmail(email: string): Promise<IUserDocument | null> {
        return User.findByEmail(email);
    }

    async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
        return User.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
            '+password',
        );
    }

    async findById(id: string): Promise<IUserDocument | null> {
        return User.findOne({ _id: id, isDeleted: false });
    }

    async findByIdWithRefreshToken(id: string): Promise<IUserDocument | null> {
        return User.findOne({ _id: id, isDeleted: false }).select('+refreshToken');
    }

    async findByVerificationToken(token: string): Promise<IUserDocument | null> {
        return User.findOne({
            verificationToken: token,
            isDeleted: false,
        });
    }

    async create(data: RegisterDto): Promise<IUserDocument> {
        return User.create(data);
    }

    async updateRefreshToken(
        userId: string,
        refreshToken: string | null,
    ): Promise<void> {
        await User.updateOne({ _id: userId }, { refreshToken });
    }

    async verifyEmail(userId: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            { isVerified: true, verificationToken: null },
        );
    }

    async updateProfile(
        userId: string,
        data: Partial<Pick<IUserDocument, 'name' | 'email'>>,
    ): Promise<IUserDocument | null> {
        return User.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            { $set: data },
            { new: true, runValidators: true },
        );
    }

    async softDelete(userId: string): Promise<void> {
        await User.updateOne(
            { _id: userId },
            { isDeleted: true, deletedAt: new Date(), refreshToken: null },
        );
    }
}
