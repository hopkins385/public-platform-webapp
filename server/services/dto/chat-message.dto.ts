export class ChatMessageDto {
  readonly role: 'user' | 'assistant';
  readonly content: string;

  constructor(role: 'user' | 'assistant', content: string) {
    this.role = role;
    this.content = content;
  }

  static fromInput(input: {
    role: 'user' | 'assistant';
    content: string;
  }): ChatMessageDto {
    return new ChatMessageDto(input.role, input.content);
  }
}

export class CreateChatMessageDto {
  readonly userId: string;
  readonly chatId: string;
  readonly message: ChatMessageDto;

  constructor(userId: string, chatId: string, chatMessage: ChatMessageDto) {
    this.userId = userId.toLowerCase();
    this.chatId = chatId.toLowerCase();
    this.message = ChatMessageDto.fromInput(chatMessage);
  }

  static fromInput(input: {
    userId: string;
    chatId: string;
    message: ChatMessageDto;
  }): CreateChatMessageDto {
    return new CreateChatMessageDto(input.userId, input.chatId, input.message);
  }
}
