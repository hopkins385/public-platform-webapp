import { createTransport } from 'nodemailer';
import { consola } from 'consola';
import type { Transporter, TransportOptions } from 'nodemailer';
import type { RuntimeConfig } from 'nuxt/schema';
import handlebars from 'handlebars';
import { SendMailDto } from './dto/send-mail.dto';
import { ConfirmMailDto } from './dto/confirm-mail.dto';
import { useRuntimeConfig } from '#imports';

export class MailerService {
  private readonly transporter: Transporter;
  private readonly config: RuntimeConfig['mailer'];

  constructor() {
    this.config = useRuntimeConfig().mailer;
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false,
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    } as TransportOptions);
  }

  async sendMail(payload: SendMailDto) {
    const source = await useStorage().getItem(
      'root:assets:mail:transactional.hbs',
    );
    const compileSource = handlebars.compile(source);
    try {
      return await this.transporter.sendMail({
        from: `${payload.fromName} ${payload.fromEmail}`,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: compileSource(payload.body),
      });
    } catch (error) {
      consola.error(error);
    }
  }

  async sendConfirmMail(payload: ConfirmMailDto) {
    const mailTemplate = await useStorage().getItem(
      'root:assets:mail:confirm.hbs',
    );
    if (!mailTemplate) throw new Error('mailTemplate not found');

    const compileSource = handlebars.compile(mailTemplate);

    try {
      return await this.transporter.sendMail({
        from: `${this.config.fromName} ${this.config.fromEmail}`,
        to: `${payload.firstName} ${payload.lastName} ${payload.toEmail}`,
        subject: 'Confirm your email address',
        html: compileSource({
          name: payload.firstName,
          url: 'http://localhost:3000/confirm/mail',
        }),
      });
    } catch (error) {
      consola.error(error);
      throw new Error('Error sending mail');
    }
  }
}
