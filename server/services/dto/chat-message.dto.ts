export class ChatMessageDto {
  readonly type: 'text' | 'image';
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly visionContent?: any;

  constructor(
    type: 'text' | 'image',
    role: 'user' | 'assistant',
    content: string,
    visionContent?: any,
  ) {
    this.type = type;
    this.role = role;
    this.content = content;
    this.visionContent = visionContent;
  }

  static fromInput(input: {
    type: 'text' | 'image';
    role: 'user' | 'assistant';
    content: string;
    visionContent?: any;
  }): ChatMessageDto {
    return new ChatMessageDto(
      input.type,
      input.role,
      input.content,
      input.visionContent,
    );
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
