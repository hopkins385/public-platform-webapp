export class LastLoginDto {
  readonly email: string;
  readonly lastLoginAt: Date;

  constructor(email: string, lastLoginAt: Date) {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!lastLoginAt) {
      throw new Error('Last login date is required');
    }

    this.email = email;
    this.lastLoginAt = lastLoginAt;
  }

  static fromInput(data: { email: string; lastLoginAt: Date }) {
    return new LastLoginDto(data.email, data.lastLoginAt);
  }
}
