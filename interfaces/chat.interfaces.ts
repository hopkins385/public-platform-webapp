export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

export interface ChatConversation {
  messages: ChatMessage[];
  model: string;
  lang: string;
  assistantId?: string | null;
}
