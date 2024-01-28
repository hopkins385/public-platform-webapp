export class CreateUserDto {
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly lastLoginAt: Date;

  constructor(email: string, name: string, password: string) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.lastLoginAt = new Date();
  }
}
