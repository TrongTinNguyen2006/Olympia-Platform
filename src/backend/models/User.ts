import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  fullName: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: number;
  role: 'ADMIN' | 'USER';
  savedMatches?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Number },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  savedMatches: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
