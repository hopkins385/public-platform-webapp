export class ConfirmMailDto {
  readonly toEmail: string;
  readonly firstName: string;
  readonly lastName: string;

  constructor(toEmail: string, firstName: string, lastName: string) {
    this.toEmail = toEmail;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
