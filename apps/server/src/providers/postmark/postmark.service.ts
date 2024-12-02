import { Injectable } from '@nestjs/common';
import { Models, ServerClient } from 'postmark';

@Injectable()
export class PostmarkService {
  private _postmarkClient: ServerClient;

  constructor() {
    this._postmarkClient = new ServerClient(
      process.env.POSTMARK_API_KEY as string,
    );
  }

  send(mail: Models.Message): Promise<Models.MessageSendingResponse> {
    try {
      return this._postmarkClient.sendEmail(mail);
    } catch (error) {
      throw new Error(error);
    }
  }

  sendTemplated(
    mail: Models.TemplatedMessage,
  ): Promise<Models.MessageSendingResponse> {
    try {
      return this._postmarkClient.sendEmailWithTemplate(mail);
    } catch (error) {
      throw new Error(error);
    }
  }
}
