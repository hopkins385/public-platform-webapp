import type { ChatMessage } from '~/interfaces/chat.interfaces';
import { ULID } from '~/server/utils/ulid';
import type { CreateChatMessageDto } from './dto/chat-message.dto';
import { TRPCError } from '@trpc/server';
import consola from 'consola';

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

const logger = consola.create({}).withTag('chat.service');

function notLowerZero(value: number) {
  return value < 0 ? 0 : value;
}

export class ChatService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
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
    const messages = payload.chatMessages.map((message) => {
      const tokenCount = getTokenCount(message.content);
      return this.prisma.chatMessage.upsert({
        where: {
          id: message.id,
        },
        create: {
          id: message.id,
          chatId: payload.chatId.toLowerCase(),
          role: message.role,
          content: message.content,
          tokenCount,
        },
        update: {
          content: message.content,
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
      relationLoadStrategy: 'join',
      select: {
        id: true,
        title: true,
        // with messages relation
        messages: {
          select: {
            id: true,
            type: true,
            role: true,
            content: true,
            visionContent: true,
            tokenCount: true,
          },
          orderBy: {
            createdAt: 'asc',
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
                multiModal: true,
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

  getChatAndCreditsForUser(chatId: string, userId: string) {
    if (!chatId || !userId) {
      return null;
    }
    return this.prisma.chat.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        title: true,
        user: {
          select: {
            id: true,
            credit: {
              select: {
                amount: true,
              },
            },
          },
        },
        assistant: {
          select: {
            id: true,
            systemPrompt: true,
          },
        },
      },
      where: {
        id: chatId.toLowerCase(),
        userId: userId.toLowerCase(),
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
    const tokenCount = getTokenCount(payload.message.content);
    try {
      return await this.prisma.chatMessage.create({
        data: {
          id: ULID(),
          chatId: payload.chatId,
          type: payload.message.type,
          role: payload.message.role,
          content: payload.message.content,
          visionContent: payload.message.visionContent,
          tokenCount,
        },
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async createMessageAndReduceCredit(payload: CreateChatMessageDto) {
    const tokenCount = getTokenCount(payload.message.content);
    try {
      const res = await this.prisma.$transaction([
        // create message
        this.prisma.chatMessage.create({
          data: {
            id: ULID(),
            chatId: payload.chatId,
            type: payload.message.type,
            role: payload.message.role,
            content: payload.message.content,
            visionContent: payload.message.visionContent,
            tokenCount,
          },
        }),
        // reduce credit
        this.prisma.credit.update({
          where: {
            userId: payload.userId,
          },
          data: {
            amount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return res[0];
    } catch (error) {
      logger.error(error);
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  updateChatTitle(chatId: string, title: string) {
    return this.prisma.chat.update({
      where: {
        id: chatId.toLowerCase(),
        deletedAt: null,
      },
      data: {
        title,
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

  // POLICIES

  async canAccessChatPolicy(chat: any, user: any) {
    if (chat.user.id !== user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this chat',
      });
    }

    return true;
  }

  async canCreateChatPolicy(
    assistantId: string,
    teamId: string,
    userId: string,
  ) {
    // find the assistant by id
    const assistant = await this.prisma.assistant.findFirst({
      where: {
        id: assistantId.toLowerCase(),
        teamId: teamId.toLowerCase(),
      },
    });

    if (!assistant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Assistant not found',
      });
    }

    return true;
  }

  async canCreateMessagePolicy(payload: CreateChatMessageDto) {
    // get the chat
    const chat = await this.getFirst(payload.chatId);
    if (!chat) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chat not found',
      });
    }

    // check if the user is the owner of the chat
    if (chat.userId !== payload.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this chat',
      });
    }

    return true;
  }

  async canClearMessagesPolicy(chatId: string, userId: string) {
    // get the chat
    const chat = await this.getFirst(chatId);
    if (!chat) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chat not found',
      });
    }

    // check if the user is the owner of the chat
    if (chat.userId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this chat',
      });
    }

    return true;
  }

  async canDeletePolicy(chatId: string, userId: string) {
    // get the chat
    const chat = await this.getFirst(chatId);
    if (!chat) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chat not found',
      });
    }

    // check if the user is the owner of the chat
    if (chat.userId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this chat',
      });
    }

    return true;
  }
}
