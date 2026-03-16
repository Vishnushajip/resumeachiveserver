import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { FirebaseService } from '../common/firebase.service';

@Module({
  controllers: [TestimonialsController],
  providers: [TestimonialsService, FirebaseService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
