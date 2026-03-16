import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { FirebaseService } from '../common/firebase.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, FirebaseService],
  exports: [ContactService],
})
export class ContactModule {}
