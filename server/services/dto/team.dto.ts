export class FindTeamUserDto {
  readonly userId: string | undefined;
  readonly teamId: string;

  constructor(userId: string | undefined, teamId: string) {
    this.userId = userId?.toLowerCase();
    this.teamId = teamId.toLowerCase();
  }
}
