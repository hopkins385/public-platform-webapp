export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VisionTextContent {
  type: 'text';
  text: string;
}

export interface VisionImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

type VisionContent = VisionTextContent | VisionImageUrlContent;

export interface VisionChatMessage {
  role: 'user' | 'assistant';
  content: VisionContent[];
}

export interface ChatConversation {
  messages: ChatMessage[];
  model: string;
  lang: string;
  chatId?: string | null;
}
