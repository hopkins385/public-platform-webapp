export class GetAllChatsForUserDto {
  readonly userId: string;
  readonly page: number;
  readonly searchQuery: string | undefined;

  constructor(userId: string, page: number, searchQuery?: string) {
    this.userId = userId.toLowerCase();
    this.page = Number(page);
    this.searchQuery = searchQuery?.toString();
  }

  static fromInput(input: { userId: string; page: number; searchQuery?: string }): GetAllChatsForUserDto {
    return new GetAllChatsForUserDto(input.userId, input.page, input.searchQuery);
  }
}
