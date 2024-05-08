export class CreateTeamUserDto {
  readonly userId: string;
  readonly teamId: string;

  constructor(userId: string, teamId: string) {
    this.userId = userId.toLowerCase();
    this.teamId = teamId.toLowerCase();
  }
}

export class FindTeamUserDto {
  readonly userId: string | undefined;
  readonly teamId: string;

  constructor(userId: string | undefined, teamId: string) {
    this.userId = userId?.toLowerCase();
    this.teamId = teamId.toLowerCase();
  }
}
