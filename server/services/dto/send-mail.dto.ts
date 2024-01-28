export class SendMailDto {
  readonly fromName: string;
  readonly fromEmail: string;
  readonly to: string;
  readonly subject: string;
  readonly text?: string;
  readonly body?: string;
  readonly attachments?: string;

  constructor(
    fromName: string,
    fromEmail: string,
    to: string,
    subject: string,
    text?: string,
    body?: string,
    attachments?: string,
  ) {
    this.fromName = fromName;
    this.fromEmail = fromEmail;
    this.to = to;
    this.subject = subject;
    this.text = text;
    this.body = body;
    this.attachments = attachments;
  }
}
