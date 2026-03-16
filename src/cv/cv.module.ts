import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { FirebaseService } from '../common/firebase.service';

@Module({
  controllers: [CvController],
  providers: [CvService, FirebaseService],
  exports: [CvService],
})
export class CvModule {}
