export class TrackTokensDto {
  readonly userId: string;
  readonly llm: {
    provider: string;
    model: string;
  };
  readonly usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  constructor(
    userId: string,
    llm: { provider: string; model: string },
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
  ) {
    this.userId = userId.toLowerCase();
    this.llm = llm;
    this.usage = usage;
  }

  static fromInput(input: TrackTokensDto): TrackTokensDto {
    return new TrackTokensDto(input.userId, input.llm, input.usage);
  }
}
