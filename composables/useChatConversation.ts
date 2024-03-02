import type { ChatConversation } from './../interfaces/chat.interfaces';

export default function useChatConversation() {
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  const getMessages = async () => {
    const response = await fetch('/api/messages', {
      signal: ac.signal,
    });
    const messages = await response.json();
    return messages;
  };

  const postConversation = (signal: AbortSignal, payload: ChatConversation) => {
    return $fetch('/api/chat/conversation', {
      signal,
      method: 'POST',
      body: {
        ...payload,
      },
      responseType: 'stream',
    });
  };

  return {
    getMessages,
    postConversation,
  };
}
