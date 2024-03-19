export class ConfirmMailDto {
  readonly userId: string;
  readonly toEmail: string;
  readonly firstName: string;
  readonly lastName: string;

  constructor(
    userId: string,
    toEmail: string,
    firstName: string,
    lastName: string,
  ) {
    this.userId = userId;
    this.toEmail = toEmail;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
