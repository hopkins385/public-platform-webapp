export interface ChatImage {
  src: string;
  status: 'loading' | 'loaded' | 'error';
}

export interface VisionImageUrlContent {
  type: string;
  url: string;
}

// see above example for visionContent
export type ChatMessageVisionContent = VisionImageUrlContent;

export interface ChatMessage {
  type: 'text' | 'image' | 'video' | 'audio';
  role: 'user' | 'assistant';
  content: string;
  visionContent?: ChatMessageVisionContent[] | null | undefined;
}

export interface ChatConversation {
  messages: ChatMessage[];
  model: string;
  lang: string;
  chatId?: string | null;
}
