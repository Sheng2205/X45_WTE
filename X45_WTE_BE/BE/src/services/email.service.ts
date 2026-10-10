import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!env.smtpHost && process.env.NODE_ENV !== 'test') {
    console.warn(`[SMTP NOTICE] SMTP_HOST is not configured. Email to "${to}" was skipped.`);
    return;
  }
  await transporter.sendMail({ from: env.emailFrom || env.smtpUser, to, subject, html });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const expiresInMinutes = env.otpExpiresMinutes;
  console.log(`[AUTH OTP] Mã OTP đăng ký cho ${to}: ${otp} (hiệu lực ${expiresInMinutes} phút)`);
  
  const sendTask = (async () => {
    try {
      await sendEmail(
        to,
        'Mã xác thực OTP - WhatToEat',
        `
        <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
            <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
              <p style="margin:0 0 8px;font-size:12px;color:#ea580c;letter-spacing:0.08em;font-weight:700;text-transform:uppercase;">
                WhatToEat - Bếp Nhà
              </p>
              <h2 style="margin:0 0 10px;font-size:22px;color:#18181b;">Mã OTP Xác Thực Đăng Ký</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
                Sử dụng mã OTP 6 số dưới đây để kích hoạt tài khoản của bạn. Mã có hiệu lực trong ${expiresInMinutes} phút.
              </p>
              <div style="margin:0 0 18px;padding:14px;border-radius:12px;background:#fff7ed;border:1px dashed #f97316;text-align:center;">
                <span style="font-size:32px;font-weight:700;letter-spacing:0.35em;color:#ea580c;">${otp}</span>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#52525b;">Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">Vì lý do bảo mật, tuyệt đối không chia sẻ mã OTP này cho bất kỳ ai.</p>
            </div>
          </div>
        </div>
        `
      );
    } catch (error: any) {
      console.error(`[SMTP ERROR] Không thể gửi email OTP tới ${to}:`, error?.message || error);
      if (process.env.NODE_ENV === 'test') {
        throw error;
      }
    }
  })();

  if (process.env.NODE_ENV === 'test') {
    await sendTask;
  }
};

export const sendResetTokenEmail = async (to: string, token: string) => {
  console.log(`[AUTH RESET] Mã đặt lại mật khẩu cho ${to}: ${token} (hiệu lực ${env.resetTokenExpiresMinutes} phút)`);
  
  const sendTask = (async () => {
    try {
      await sendEmail(
        to,
        'Mã OTP đặt lại mật khẩu - WhatToEat',
        `
        <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
            <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
              <p style="margin:0 0 8px;font-size:12px;color:#ea580c;letter-spacing:0.08em;font-weight:700;text-transform:uppercase;">
                WhatToEat - Bếp Nhà
              </p>
              <h2 style="margin:0 0 10px;font-size:22px;color:#18181b;">Mã OTP Đặt Lại Mật Khẩu</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
                Sử dụng mã OTP 6 số dưới đây để đặt lại mật khẩu của bạn. Mã có hiệu lực trong ${env.resetTokenExpiresMinutes} phút.
              </p>
              <div style="margin:0 0 18px;padding:14px;border-radius:12px;background:#fff7ed;border:1px dashed #f97316;text-align:center;">
                <span style="font-size:32px;font-weight:700;letter-spacing:0.35em;color:#ea580c;">${token}</span>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#52525b;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">Vì lý do bảo mật, tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
          </div>
        </div>
        `
      );
    } catch (error: any) {
      console.error(`[SMTP ERROR] Không thể gửi email đặt lại mật khẩu tới ${to}:`, error?.message || error);
      if (process.env.NODE_ENV === 'test') {
        throw error;
      }
    }
  })();

  if (process.env.NODE_ENV === 'test') {
    await sendTask;
  }
};
