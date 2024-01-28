export class StreamFinishedDto {
  llmMessage: string;

  constructor(llmMessage: string) {
    this.llmMessage = llmMessage;
  }
}
