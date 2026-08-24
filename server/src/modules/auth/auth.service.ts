import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { environment } from '../../config/environment.js';
import { AppError } from '../../utils/app-error.js';
import { authRepository } from './auth.repository.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import type { PublicUser } from './auth.types.js';

const createToken = (user: PublicUser) =>
  jwt.sign({ role: user.role }, environment.JWT_SECRET, {
    subject: user.id,
    expiresIn: environment.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });

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
      message: 'If an account exists for this mobile number, password reset instructions will be sent.',
    };
  },
};
