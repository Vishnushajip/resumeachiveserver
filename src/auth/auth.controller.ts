import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body('email') email: string) {
    return this.auth.sendOtp(email);
  }

  @Post('verify-otp')
  verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.auth.verifyOtp(email, otp);
  }
}
