import type { ChatMessage } from '~/interfaces/chat.interfaces';
import { ULID } from '~/server/utils/ulid';
import type { CreateChatMessageDto } from './dto/chat-message.dto';

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

function notLowerZero(value: number) {
  return value < 0 ? 0 : value;
}

export class ChatService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
  }

  getHistory(
    chat: any,
    totalAvailableTokens: number,
    requestedCompletionTokens: number,
  ) {
    if (!chat || !chat.messages) {
      throw new Error('Chat not found or has no messages');
    }
    const chatMessages = chat.messages;
    const messagesCount = chatMessages.length;
    const availableHistoryTokens = notLowerZero(
      totalAvailableTokens - requestedCompletionTokens,
    );
    let tokenCount = 0;
    let i = messagesCount - 1; // start from the end of the array
    let messages = [];

    while (i > 0 && tokenCount <= availableHistoryTokens) {
      const message = chatMessages[i];
      tokenCount += message.tokenCount || 0;
      messages.push(message);
      i--;
    }

    return messages;
  }

  upsertMessages(payload: UpsertChatMessages) {
    // update or create messages
    const messages = payload.chatMessages.map((data) => {
      const tokenCount = getTokenCount(data.message?.content);
      return this.prisma.chatMessage.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
          chatId: payload.chatId.toLowerCase(),
          role: data.role,
          message: data.message,
          tokenCount,
        },
        update: {
          message: data.message,
          tokenCount,
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
      },
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async getRecentForUser(userId: string) {
    const chat = await this.prisma.chat.findFirst({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      where: {
        userId: userId.toLowerCase(),
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chat;
  }

  getAllForUserPaginate(userId: string, page: number) {
    return this.prisma.chat
      .paginate({
        select: {
          id: true,
          title: true,
          createdAt: true,
          assistant: {
            select: {
              id: true,
              title: true,
              llm: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
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
            message: true,
            tokenCount: true,
          },
        },
        assistant: {
          select: {
            id: true,
            title: true,
            systemPrompt: true,
            llm: {
              select: {
                provider: true,
                displayName: true,
                apiName: true,
              },
            },
          },
        },
      },
      where: {
        id: chatId.toLowerCase(),
        userId,
        deletedAt: null,
      },
    });
  }

  create(assistantId: string, userId: string) {
    return this.prisma.chat.create({
      data: {
        id: ULID(),
        title: 'Chat',
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

  async createMessage(payload: CreateChatMessageDto) {
    const tokenCount = getTokenCount(payload.data.message?.content);

    try {
      return await this.prisma.chatMessage.create({
        data: {
          id: ULID(),
          chatId: payload.chatId.toLowerCase(),
          role: payload.data.role,
          message: payload.data.message,
          tokenCount,
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

  softDelete(userId: string, chatId: string) {
    return this.prisma.chat.update({
      where: {
        id: chatId.toLowerCase(),
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  delete(userId: string, chatId: string) {
    return this.prisma.chat.delete({
      where: {
        id: chatId.toLowerCase(),
        userId,
      },
      include: {
        messages: true,
      },
    });
  }
}
