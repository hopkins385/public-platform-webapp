export class ChatToolCallEventDto {
  readonly userId: string;
  readonly chatId: string;
  readonly toolName: string;

  constructor(userId: string, chatId: string, toolName: string) {
    this.userId = userId;
    this.chatId = chatId;
    this.toolName = toolName;
  }

  static fromInput(input: { userId: string; chatId: string; toolName: string }): ChatToolCallEventDto {
    return new ChatToolCallEventDto(input.userId, input.chatId, input.toolName);
  }
}
