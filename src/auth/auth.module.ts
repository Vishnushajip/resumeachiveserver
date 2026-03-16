import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from '../common/email.service';
import { FirebaseService } from '../common/firebase.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EmailService, FirebaseService],
  exports: [AuthService],
})
export class AuthModule {}
