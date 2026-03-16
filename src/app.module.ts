import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { ContactModule } from './contact/contact.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CvModule } from './cv/cv.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AiModule,
    ContactModule,
    AnalyticsModule,
    CvModule,
    TestimonialsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
