import { Module } from '@nestjs/common';
import { PostmarkService } from './postmark.service';
import { MailService } from './mail.service';

@Module({
  providers: [PostmarkService, MailService],
  exports: [MailService],
})
export class PostmarkModule {}
