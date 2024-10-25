import type { ChatMessage, VisionImageUrlContent } from '~/interfaces/chat.interfaces';
import type { CreateChatMessageDto } from './dto/chat-message.dto';
import type { GetAllChatsForUserDto } from './dto/chat.dto';
import type { ExtendedPrismaClient } from '../prisma';
import type { UseEvents } from '../events/useEvents';
import type { CollectionService } from './collection.service';
import type { EmbeddingService } from './embedding.service';
import type { Assistant, Chat, ChatMessage as PrismaChatMessage } from '@prisma/client';
import type { TokenizerService } from './tokenizer.service';
import { TRPCError } from '@trpc/server';
import { FirstUserMessageEventDto } from './dto/event.dto';
import { CollectionAbleDto } from './dto/collection-able.dto';
import consola from 'consola';
import type { SessionUser } from '../schemas/loginSchema';

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
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly collectionService: CollectionService,
    private readonly embeddingService: EmbeddingService,
    private readonly tokenizerService: TokenizerService,
    private readonly event: UseEvents['event'],
  ) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  getHistory(chat: any, totalAvailableTokens: number, requestedCompletionTokens: number) {
    if (!chat || !chat.messages) {
      throw new Error('Chat not found or has no messages');
    }
    const chatMessages = chat.messages;
    const messagesCount = chatMessages.length;
    const availableHistoryTokens = notLowerZero(totalAvailableTokens - requestedCompletionTokens);
    let tokenCount = 0;
    let i = messagesCount - 1; // start from the end of the array
    const messages = [];

    while (i > 0 && tokenCount <= availableHistoryTokens) {
      const message = chatMessages[i];
      tokenCount += message.tokenCount || 0;
      messages.push(message);
      i--;
    }

    return messages;
  }

  async upsertMessages(payload: UpsertChatMessages) {
    throw new Error('Method not implemented.');
    // update or create messages
    /*const messages = payload.chatMessages.map(async (message) => {
      const { tokenCount } = await this.tokenizerService.getTokens(message.content);
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
    return messages;*/
  }

  upsert(payload: UpsertChat) {
    throw new Error('Method not implemented.');
  }

  getFirst(chatId: string | undefined) {
    if (!chatId) {
      return null;
    }
    return this.prisma.chat.findFirst({
      select: {
        id: true,
        title: true,
        userId: true,
      },
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

  getAllForUserPaginate(payload: GetAllChatsForUserDto) {
    return this.prisma.chat
      .paginate({
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
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
          userId: payload.userId,
          title: {
            contains: payload.searchQuery,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
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
            updatedAt: 'asc',
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
            tools: {
              select: {
                toolId: true,
                tool: {
                  select: {
                    functionId: true,
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
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

  async createMessage(userId: string, chatId: string, messages: ChatMessage[]): Promise<PrismaChatMessage> {
    const lastMessage = this.getLastChatMessage(messages);
    const { tokenCount } = await this.tokenizerService.getTokens(lastMessage.content);
    try {
      const message = await this.prisma.chatMessage.create({
        data: {
          chatId: chatId,
          type: lastMessage.type,
          role: lastMessage.role,
          content: lastMessage.content,
          visionContent: lastMessage.visionContent,
          tokenCount,
        },
      });

      // Update chat title if it's the first message of the chat
      if (messages.length === 1) {
        this.emitFirstUserMessageEvent(chatId, userId, lastMessage);
      }

      return message;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async createMessageAndReduceCredit(payload: CreateChatMessageDto) {
    const { tokenCount } = await this.tokenizerService.getTokens(payload.message.content);
    try {
      const res = await this.prisma.$transaction([
        // create message
        this.prisma.chatMessage.create({
          data: {
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
        // update chat updated at
        this.prisma.chat.update({
          where: {
            id: payload.chatId,
          },
          data: {
            updatedAt: new Date(),
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
        chatId: chatId.toLowerCase(),
      },
    });
  }

  getChatMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        chatId: chatId.toLowerCase(),
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
        userId: userId.toLowerCase(),
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

  deleteAllChatsByUserId(userId: string) {
    return this.prisma.chat.deleteMany({
      where: {
        userId,
      },
    });
  }

  async deleteChatMessagesByUserId(userId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: {
        chat: {
          userId,
        },
      },
    });
  }

  // POLICIES

  canCreateChatPolicy(user: SessionUser, assistant: any): boolean {
    const { teamId: userTeamId } = user;
    const {
      team: { id: assistantTeamId },
    } = assistant;

    if (assistantTeamId !== userTeamId) {
      return false;
    }

    return true;
  }

  canClearMessagesPolicy(user: SessionUser, chat: any) {
    const { id: userId } = user;
    const { userId: chatUserId } = chat;

    // check if the user is the owner of the chat
    if (chatUserId !== userId) {
      return false;
    }

    return true;
  }

  async canDeletePolicy(user: SessionUser, chat: any) {
    const { id: userId } = user;
    const { userId: chatUserId } = chat;

    // check if the user is the owner of the chat
    if (chatUserId !== userId) {
      return false;
    }

    return true;
  }

  // EVENTS

  emitFirstUserMessageEvent(chatId: string, userId: string, lastMessage: ChatMessage) {
    this.event(
      ChatEvent.FIRST_USERMESSAGE,
      FirstUserMessageEventDto.fromInput({
        chatId,
        userId,
        messageContent: lastMessage.content,
      }),
    );
  }

  // MISC

  getLastChatMessage(messages: any[]) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      logger.error('No last message');
      throw new Error('No last message');
    }
    return lastMessage;
  }

  getVisionMessages(vis: VisionImageUrlContent[] | null | undefined) {
    if (!vis) {
      return [];
    }
    return vis.map((v) => {
      if (!v.url) throw new Error('VisionImageUrlContent url is required');
      // this format is vercel ai sdk specific!
      return {
        type: 'image',
        image: new URL(v.url),
      };
    });
  }

  formatChatMessages(messages: ChatMessage[] | null | undefined) {
    if (!messages) {
      return [];
    }
    return messages.map((message) => {
      if (message.type === 'image' && message.visionContent) {
        const text = {
          type: 'text',
          text: message.content,
        };
        return {
          role: message.role,
          content: [text, ...this.getVisionMessages(message.visionContent)],
        };
      }
      return {
        role: message.role,
        content: message.content,
      };
    }); // satisfies CoreMessage[];
  }

  async getContextAwareSystemPrompt(payload: {
    assistantId: string;
    lastMessageContent: string;
    assistantSystemPrompt: string;
  }) {
    const timestamp = '\n\n' + 'Timestamp now(): ' + new Date().toISOString();
    // return payload.assistantSystemPrompt;
    const collections = await this.collectionService.findAllWithRecordsFor(
      CollectionAbleDto.fromInput({
        id: payload.assistantId,
        type: 'assistant',
      }),
    );

    if (collections.length < 1) {
      return payload.assistantSystemPrompt + timestamp;
    }

    const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();
    const res = await this.embeddingService.searchDocsByQuery({
      query: payload.lastMessageContent,
      recordIds,
    });

    const context = res.map((r) => r?.text || '').join('\n\n');

    console.log('system prompt context:', context);

    return payload.assistantSystemPrompt + '\n\n<context>' + context + '</context>' + timestamp;
  }
}
