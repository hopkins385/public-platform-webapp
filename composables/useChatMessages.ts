import type { ChatMessage } from '../interfaces/chat.interfaces';

const dummy = [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'What are in these images? Is there any difference between them?',
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
        },
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
        },
      },
    ],
  },
];

export default function useChatMessages() {
  const chatMessages = ref<ChatMessage[]>(dummy);

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
