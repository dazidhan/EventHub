import mongoose, { Schema, type Document, type Model, type Types, type CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../interfaces/common.js';

// ─── Interface ───────────────────────────────────────────
export interface IUser {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isVerified: boolean;
    verificationToken: string | null;
    refreshToken: string | null;
    isDeleted: boolean;
    deletedAt: Date | null;
}

export interface IUserDocument extends IUser, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, ORGANIZER, USER]
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ─── Schema ──────────────────────────────────────────────
const userSchema = new Schema<IUserDocument, IUserModel>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // exclude from queries by default
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
            index: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            default: null,
        },
        refreshToken: {
            type: String,
            default: null,
            select: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc: IUserDocument, ret: Record<string, unknown>) {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.verificationToken;
                delete ret.__v;
                return ret;
            },
        },
    },
);

// ─── Indexes ─────────────────────────────────────────────
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ role: 1, isDeleted: 1 });

// ─── Pre-save: Hash Password ────────────────────────────
userSchema.pre('save', async function (this: IUserDocument, next: (err?: CallbackError) => void) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Instance Methods ────────────────────────────────────
userSchema.methods.comparePassword = async function (
    this: IUserDocument,
    candidatePassword: string,
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// ─── Static Methods ─────────────────────────────────────
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

// ─── Model ───────────────────────────────────────────────
export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
