export class LastLoginDto {
  readonly email: string;
  readonly lastLoginAt: Date;

  constructor(email: string, lastLoginAt: Date) {
    this.email = email;
    this.lastLoginAt = lastLoginAt;
  }
}
