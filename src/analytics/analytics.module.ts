import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { FirebaseService } from '../common/firebase.service';

@Module({
  imports: [],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, FirebaseService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
