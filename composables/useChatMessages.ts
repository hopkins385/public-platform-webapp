import type {
  ChatMessage,
  ChatMessageVisionContent,
} from '../interfaces/chat.interfaces';

export default function useChatMessages() {
  const chatMessages = ref<ChatMessage[]>([]);

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
    addMessageToChat,
    getRawMessages,
    getFormattedMessages,
    clearMessages,
    initMessages,
  };
}
