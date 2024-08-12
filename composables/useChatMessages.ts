import type { ChatMessage, ChatMessageVisionContent } from '../interfaces/chat.interfaces';

export default function useChatMessages() {
  const chatMessages = ref<ChatMessage[]>([]);

  /**
   * Add a message to the chat
   * @param type
   * @param role
   * @param content
   * @param visionContent
   * @returns void
   */
  function addMessageToChat({
    type,
    role,
    content,
    visionContent,
  }: {
    type: 'text' | 'image';
    role: 'user' | 'assistant';
    content: string;
    visionContent?: ChatMessageVisionContent[];
  }) {
    chatMessages.value.push({ type, role, content, visionContent });
  }

  function getRawMessages() {
    return chatMessages.value;
  }

  function getFormattedMessages() {
    return chatMessages.value;
  }

  /**
   * Clear the chat messages
   */
  function clearMessages() {
    chatMessages.value = [];
  }

  /**
   * Initialize the chat messages
   * @param messages
   */
  function initMessages(messages: ChatMessage[]) {
    chatMessages.value = messages;
  }

  const messages = computed(() => chatMessages.value);
  const hasMessages = computed(() => chatMessages.value.length > 0);

  return {
    messages,
    hasMessages,
    addMessageToChat,
    getRawMessages,
    getFormattedMessages,
    clearMessages,
    initMessages,
  };
}
