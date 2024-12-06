import { Inject, Injectable } from '@nestjs/common';
import { PostmarkService } from './postmark.service';
import { Models } from 'postmark';
import { Mail } from '../../types';

@Injectable()
export class MailService {
  @Inject()
  private _postmarkService: PostmarkService;

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<Models.MessageSendingResponse> {
    const mail: Models.Message = {
      From: 'no-reply@doone.it',
      To: to,
      Subject: subject,
      TextBody: body,
    };

    return await this._postmarkService.send(mail);
  }

  async sendEmailWithTemplate<T extends Mail>(
    templateType: typeof Mail & { templateId: number },
    to: string,
    templateData: T['templateData'],
  ): Promise<Models.MessageSendingResponse> {
    const mail: Models.TemplatedMessage = {
      From: 'no-reply@doone.it',
      To: to,
      TemplateId: templateType.templateId,
      TemplateModel: templateData,
    };

    return await this._postmarkService.sendTemplated(mail);
  }
}
