import { Mail } from '../mail';

export class VerificationEmail extends Mail {
  static templateId = 38208837;

  templateData: {
    name: string;
    verificationCode: number;
    recipientMail: string;
  };
}
