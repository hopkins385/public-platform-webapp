import type { ChatMessage } from '~/interfaces/chat.interfaces';
import { ULID } from '~/server/utils/ulid';

interface UpsertMessage extends ChatMessage {
  id: string;
}

interface UpsertChatMessages {
  chatId: string;
  chatMessages: UpsertMessage[];
}

interface UpsertChat {
  chatId: string;
}

interface StoreChatMessage {
  chatId: string;
  chatMessage: ChatMessage;
}

export class ChatService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('ChatService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  getHistory(chatId: string) {
    console.log('getChatHistory');
  }

  upsertMessages(payload: UpsertChatMessages) {
    // update or create messages
    const messages = payload.chatMessages.map((message) => {
      return this.prisma.chatMessage.upsert({
        where: {
          id: message.id,
        },
        create: {
          id: message.id,
          chatId: payload.chatId.toLowerCase(),
          role: message.role,
          content: message.content,
          tokenCount: getTokenCount(message.content),
        },
        update: {
          content: message.content,
          tokenCount: getTokenCount(message.content),
        },
      });
    });
    return messages;
  }

  upsert(payload: UpsertChat) {
    throw new Error('Method not implemented.');
  }

  getFirst(chatId: string | undefined) {
    if (!chatId) {
      return null;
    }
    return this.prisma.chat.findFirst({
      where: {
        id: chatId.toLowerCase(),
      },
    });
  }

  getAllForUser(userId: string) {
    return this.prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        /*assistant: {
          select: {
            id: true,
            title: true,
          },
        },*/
      },
      where: {
        userId,
      },
    });
  }

  getChatForUser(chatId: string, userId: string) {
    if (!chatId || !userId) {
      return null;
    }
    return this.prisma.chat.findFirst({
      select: {
        id: true,
        title: true,
        // with messages relation
        messages: {
          select: {
            id: true,
            role: true,
            content: true,
            tokenCount: true,
          },
        },
        assistant: {
          select: {
            id: true,
            title: true,
            // systemPrompt: true,
          },
        },
      },
      where: {
        id: chatId.toLowerCase(),
        userId,
      },
    });
  }

  create(assistantId: string, userId: string) {
    return this.prisma.chat.create({
      data: {
        id: ULID(),
        title: 'New Chat',
        user: {
          connect: {
            id: userId,
          },
        },
        assistant: {
          connect: {
            id: assistantId,
          },
        },
      },
    });
  }

  async createMessage(payload: StoreChatMessage) {
    try {
      return await this.prisma.chatMessage.create({
        data: {
          id: ULID(),
          chatId: payload.chatId.toLowerCase(),
          role: payload.chatMessage.role,
          content: payload.chatMessage.content,
          tokenCount: getTokenCount(payload.chatMessage.content),
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  clearMessages(chatId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: {
        chatId,
      },
    });
  }

  getChatMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        chatId,
      },
    });
  }
}
