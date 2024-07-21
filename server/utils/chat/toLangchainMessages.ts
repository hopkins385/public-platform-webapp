import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { ChatMessage, VisionImageUrlContent } from '~/interfaces/chat.interfaces';

function getVisionMessages(vis: VisionImageUrlContent[] | null | undefined) {
  if (!vis) {
    return [];
  }
  return vis.map((v) => {
    return {
      type: 'image_url',
      image_url: {
        url: v.url,
      },
    };
  });
}

export function toLangchainMessages(messages: ChatMessage[] | null | undefined) {
  if (!messages) {
    return [];
  }
  return messages.map((message) => {
    if (message.type === 'image' && message.visionContent) {
      return new HumanMessage({
        content: [
          {
            type: 'text',
            text: message.content,
          },
          ...getVisionMessages(message.visionContent),
        ],
      });
    }
    switch (message.role) {
      case 'user':
        return new HumanMessage({ content: message.content });
      case 'assistant':
        return new AIMessage({ content: message.content });
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid message role',
        });
    }
  });
}
