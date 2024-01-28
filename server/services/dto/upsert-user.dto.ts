export class UpsertUserDto {
  readonly email: string;
  readonly name: string;
  readonly lastLoginAt: Date;

  constructor(email: string, name: string, lastLoginAt: Date) {
    this.email = email;
    this.name = name;
    this.lastLoginAt = lastLoginAt;
  }
}
