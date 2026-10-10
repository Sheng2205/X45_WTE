import crypto from 'crypto';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/hash';
import { generateOtp } from '../utils/otp';
import { sendOtpEmail, sendResetTokenEmail } from './email.service';

const otpExpiry = () => new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
const resetExpiry = () => new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

export const createUserWithOtp = async (email: string, password: string) => {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    if (existing.isEmailVerified) return null;

    // Account exists but was never verified:
    // Update password, issue a fresh OTP, and allow the user to complete verification.
    const otp = generateOtp();
    existing.password = await hashPassword(password);
    existing.otpCode = otp;
    existing.otpExpiresAt = otpExpiry();
    await existing.save();

    if (process.env.NODE_ENV === 'test') {
      await sendOtpEmail(email, otp);
    } else {
      sendOtpEmail(email, otp).catch((err) => console.error('[AUTH OTP ERROR]', err));
    }
    return existing;
  }

  const otp = generateOtp();
  const user = await UserModel.create({
    email,
    password: await hashPassword(password),
    otpCode: otp,
    otpExpiresAt: otpExpiry()
  });

  if (process.env.NODE_ENV === 'test') {
    await sendOtpEmail(email, otp);
  } else {
    sendOtpEmail(email, otp).catch((err) => console.error('[AUTH OTP ERROR]', err));
  }
  return user;
};

export const issueOtpForUser = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return null;

  const otp = generateOtp();
  user.otpCode = otp;
  user.otpExpiresAt = otpExpiry();
  await user.save();

  if (process.env.NODE_ENV === 'test') {
    await sendOtpEmail(user.email, otp);
  } else {
    sendOtpEmail(user.email, otp).catch((err) => console.error('[AUTH OTP ERROR]', err));
  }
  return user;
};

export const issueResetToken = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) return null;

  const token = crypto.randomInt(100000, 999999).toString();
  user.resetToken = token;
  user.resetTokenExpiresAt = resetExpiry();
  await user.save();

  if (process.env.NODE_ENV === 'test') {
    await sendResetTokenEmail(email, token);
  } else {
    sendResetTokenEmail(email, token).catch((err) => console.error('[AUTH RESET ERROR]', err));
  }
  return user;
};
