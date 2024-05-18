import type {
  ChatMessageContent,
  ChatMessageVisionContent,
} from '~/interfaces/chat.interfaces';

export class ChatMessageDto {
  readonly role: 'user' | 'assistant';
  readonly message: ChatMessageContent | ChatMessageVisionContent[];

  constructor(
    role: 'user' | 'assistant',
    message: ChatMessageContent | ChatMessageVisionContent[],
  ) {
    this.role = role;
    this.message = message;
  }

  static fromInput(input: {
    role: 'user' | 'assistant';
    message: ChatMessageContent | ChatMessageVisionContent[];
  }): ChatMessageDto {
    return new ChatMessageDto(input.role, input.message);
  }
}

export class CreateChatMessageDto {
  readonly userId: string;
  readonly chatId: string;
  readonly data: ChatMessageDto;

  constructor(userId: string, chatId: string, chatMessage: ChatMessageDto) {
    this.userId = userId.toLowerCase();
    this.chatId = chatId.toLowerCase();
    this.data = ChatMessageDto.fromInput(chatMessage);
  }

  static fromInput(input: {
    userId: string;
    chatId: string;
    data: ChatMessageDto;
  }): CreateChatMessageDto {
    return new CreateChatMessageDto(input.userId, input.chatId, input.data);
  }
}
