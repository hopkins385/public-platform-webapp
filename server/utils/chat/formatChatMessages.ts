import type { ChatMessage, VisionImageUrlContent } from '~/interfaces/chat.interfaces';

function getVisionMessages(vis: VisionImageUrlContent[] | null | undefined) {
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

export function formatChatMessages(messages: ChatMessage[] | null | undefined) {
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
        content: [text, ...getVisionMessages(message.visionContent)],
      };
    }
    return {
      role: message.role,
      content: message.content,
    };
  }); // satisfies CoreMessage[];
}
