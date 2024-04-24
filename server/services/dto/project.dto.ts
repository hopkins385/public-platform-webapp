export class CreateProjectDto {
  readonly teamId: string;
  readonly name: string;
  readonly description: string;

  constructor(teamId: string, name: string, description: string) {
    this.teamId = teamId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromRequest(input: {
    teamId: string;
    name: string;
    description: string;
  }): CreateProjectDto {
    return new CreateProjectDto(input.teamId, input.name, input.description);
  }
}

export class UpdateProjectDto {
  readonly projectId: string;
  readonly name: string;
  readonly description: string;

  constructor(projectId: string, name: string, description: string) {
    this.projectId = projectId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromRequest(input: {
    projectId: string;
    name: string;
    description: string;
  }): UpdateProjectDto {
    return new UpdateProjectDto(input.projectId, input.name, input.description);
  }
}
