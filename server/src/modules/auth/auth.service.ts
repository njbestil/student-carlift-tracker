import bcrypt from 'bcrypt';
import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { environment } from '../../config/environment.js';
import { AppError } from '../../utils/app-error.js';
import { authRepository } from './auth.repository.js';
import type { LoginInput, RegisterInput, ResetPasswordInput } from './auth.schema.js';
import type { PublicUser } from './auth.types.js';

const createToken = (user: PublicUser) =>
  jwt.sign({ role: user.role }, environment.JWT_SECRET, {
    subject: user.id,
    expiresIn: environment.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });

const matchesResetAccessToken = (providedToken: string) => {
  const expectedToken = Buffer.from(environment.PASSWORD_RESET_ACCESS_TOKEN);
  const receivedToken = Buffer.from(providedToken);

  return (
    expectedToken.length === receivedToken.length &&
    timingSafeEqual(expectedToken, receivedToken)
  );
};

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findByMobileNumber(input.mobileNumber);

    if (existingUser) {
      throw new AppError('A user with this mobile number already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createStudentUser(input.mobileNumber, passwordHash);

    return {
      user,
      token: createToken(user),
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByMobileNumber(input.mobileNumber);

    if (!user || !user.isActive) {
      throw new AppError('Invalid mobile number or password', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError('Invalid mobile number or password', 401);
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;

    return {
      user: publicUser,
      token: createToken(publicUser),
    };
  },

  async forgotPassword() {
    return {
      message: 'Password reset is not available yet. Please contact our support team if you need help recovering your account.',
    };
  },

  async resetPassword(input: ResetPasswordInput) {
    if (!matchesResetAccessToken(input.resetToken)) {
      throw new AppError('This password reset link is invalid', 403);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    const passwordUpdated = await authRepository.updatePasswordByMobileNumber(
      input.mobileNumber,
      passwordHash,
    );

    if (!passwordUpdated) {
      throw new AppError('Unable to reset password for this mobile number', 404);
    }

    return { message: 'Your password has been reset. You can now log in.' };
  },
};
