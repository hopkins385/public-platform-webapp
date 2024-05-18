import type {
  ChatMessage,
  ChatMessageContent,
  ChatMessageVisionContent,
} from '../interfaces/chat.interfaces';

export default function useChatMessages() {
  const chatMessages = ref<ChatMessage[]>([]);

  function addMessage({
    role,
    message,
  }: {
    role: 'user' | 'assistant';
    message: ChatMessageContent | ChatMessageVisionContent[];
  }) {
    chatMessages.value.push({ role: role, message: message });
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

  function initMessages(messages: ChatMessage[]) {
    chatMessages.value = messages;
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
    initMessages,
  };
}
