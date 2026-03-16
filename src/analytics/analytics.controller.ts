import { Controller, Post, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../common/decorators/public.decorator';
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Public()
  @Post('track')
  async track(
    @Headers('authorization') auth?: string,
    @Headers('x-anon-id') anonId?: string,
  ) {
    return this.service.trackTraffic(auth, anonId);
  }
}
