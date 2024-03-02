import type { ChatMessage } from '../interfaces/chat.interfaces';

export default function useChatMessages() {
  const chatMessages = ref<ChatMessage[]>([]);

  function addMessage(
    content: ChatMessage['content'],
    role: ChatMessage['role'],
  ) {
    chatMessages.value.push({ content, role });
  }

  function getRawMessages() {
    return chatMessages.value;
  }

  function getFormattedMessages() {
    return chatMessages.value;
  }

  function clearMessages() {
    chatMessages.value = [];
  }

  const messages = computed(() => chatMessages.value);
  const hasMessages = computed(() => chatMessages.value.length > 0);

  return {
    messages,
    hasMessages,
    addMessage,
    getRawMessages,
    getFormattedMessages,
    clearMessages,
  };
}
