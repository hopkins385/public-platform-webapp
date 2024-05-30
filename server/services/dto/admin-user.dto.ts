export class CreateUserByAdminDto {
  readonly teamId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isAdmin: boolean;
  readonly password: string;

  constructor(teamId: string, email: string, firstName: string, lastName: string, isAdmin: boolean, password: string) {
    this.teamId = teamId.toLowerCase();
    this.email = email.toString();
    this.firstName = firstName.toString();
    this.lastName = lastName.toString();
    this.isAdmin = Boolean(isAdmin);
    this.password = password.toString();
  }

  static fromInput(input: {
    teamId: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    password: string;
  }): CreateUserByAdminDto {
    return new CreateUserByAdminDto(
      input.teamId,
      input.email,
      input.firstName,
      input.lastName,
      input.isAdmin,
      input.password,
    );
  }
}

export class UpdateUserByAdminDto {
  readonly userId: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly isAdmin: boolean;

  constructor(userId: string, email?: string, firstName?: string, lastName?: string, isAdmin?: boolean) {
    this.userId = userId.toLowerCase();
    this.email = email?.toString();
    this.firstName = firstName?.toString();
    this.lastName = lastName?.toString();
    this.isAdmin = Boolean(isAdmin);
  }

  static fromInput(input: {
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
  }): UpdateUserByAdminDto {
    return new UpdateUserByAdminDto(input.userId, input.email, input.firstName, input.lastName, input.isAdmin);
  }
}
