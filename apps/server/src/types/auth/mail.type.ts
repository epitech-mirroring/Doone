import { Mail } from '../mail';

export class VerificationEmail extends Mail {
  static templateId = Number.parseInt(process.env.VERIFY_EMAIL_ID!, 10);

  templateData: {
    name: string;
    verificationCode: number;
    recipientMail: string;
  };
}
