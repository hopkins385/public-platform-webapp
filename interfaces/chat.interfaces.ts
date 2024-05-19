export interface ChatImage {
  src: string;
  status: 'loading' | 'loaded' | 'error';
}

export interface VisionTextContent {
  type: 'text';
  text: string;
}

export interface VisionImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface ChatMessageContent {
  content: string;
}

// see above example for visionContent
export type ChatMessageVisionContent =
  | VisionTextContent
  | VisionImageUrlContent;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatConversation {
  messages: ChatMessage[];
  model: string;
  lang: string;
  chatId?: string | null;
}
