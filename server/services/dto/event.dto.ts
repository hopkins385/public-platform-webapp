export class StreamFinishedEventDto {
  readonly chatId: string;
  readonly userId: string;
  readonly assistantId: string;
  readonly messageContent: string;

  constructor(
    chatId: string,
    userId: string,
    assistantId: string,
    messageContent: string,
  ) {
    this.chatId = chatId.toLowerCase();
    this.userId = userId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.messageContent = messageContent;
  }

  static fromInput(input: {
    chatId: string;
    userId: string;
    assistantId: string;
    messageContent: string;
  }): StreamFinishedEventDto {
    return new StreamFinishedEventDto(
      input.chatId,
      input.userId,
      input.assistantId,
      input.messageContent,
    );
  }
}
