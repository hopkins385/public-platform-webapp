import SlackNotify from 'slack-notify';

export class SlackService {
  private readonly slack: ReturnType<typeof SlackNotify>;

  constructor() {
    this.slack = SlackNotify(useRuntimeConfig().slack.webhookUrl);
  }

  sendNewUserRegistrationNotification() {
    return this.slack.send(
      'New user registration on Svenson.ai! Timestamp: ' +
        new Date().toISOString(),
    );
  }
}
