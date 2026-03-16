import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendOtp(email: string, otp: string) {
    const htmlTemplate = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Resume<span style="color: #3b82f6;">.io</span></h1>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Verify your identity</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Please use the following verification code to sign in to your Resume.io account. This code will expire in 10 minutes.</p>
          
          <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; letter-spacing: 0.2em; color: #0f172a;">${otp}</span>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px;">
          &copy; 2026 Resume.io. All rights reserved.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"Resume.io" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `[Resume.io] Your Verification Code: ${otp}`,
      html: htmlTemplate,
    });
  }
}
