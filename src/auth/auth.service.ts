import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EmailService } from '../common/email.service';
import { FirebaseService } from '../common/firebase.service';
import * as jose from 'jose';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    private firebaseService: FirebaseService,
  ) {}

  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await this.emailService.sendOtp(email, otp);

    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string) {
    const stored = this.otpStore.get(email);

    if (!stored) {
      throw new UnauthorizedException('OTP not found or already used');
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP has expired');
    }

    if (stored.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(email);

    const secret = new TextEncoder().encode(process.env.JOSE_SECRET);
    const key = await jose.importJWK({
      kty: 'oct',
      k: jose.base64url.encode(createHash('sha256').update(secret).digest()),
    });

    const token = await new jose.EncryptJWT({ email })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .encrypt(key);

    await this.firebaseService.saveAuthData(email, token);

    return { token, email };
  }
}
