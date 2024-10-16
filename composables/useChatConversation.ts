import type { ChatConversation } from './../interfaces/chat.interfaces';

export default function useChatConversation() {
  const ac = new AbortController();
  const chatSettings = useChatSettingsStore();

  const isPending = ref(false);
  const hasError = ref(false);
  const errorMessage = ref('');

  onScopeDispose(() => {
    ac.abort();
  });

  function clearError() {
    hasError.value = false;
    errorMessage.value = '';
  }

  function setError(message: string) {
    hasError.value = true;
    errorMessage.value = message;
  }

  async function getMessages() {
    clearError();
    try {
      const response = await fetch('/api/messages', {
        signal: ac.signal,
      });
      const messages = await response.json();
      return messages;
    } catch (error) {
      setError(error?.message || error);
    }
  }

  function postConversation(signal: AbortSignal, payload: ChatConversation) {
    return $fetch('/api/chat/conversation', {
      signal,
      method: 'POST',
      body: {
        ...payload,
        temperature: chatSettings.getTemperature,
        presencePenalty: chatSettings.getPresencePenalty,
        maxTokens: chatSettings.getMaxTokens,
      },
      responseType: 'stream',
      onRequest: () => {
        clearError();
        isPending.value = true;
      },
      onRequestError: (e) => {
        isPending.value = false;
        if (e.error.name === 'AbortError') return;
        console.error('[chat req.err] ', e.error.message);
        setError('Cannot process message');
      },
      onResponse: () => {
        isPending.value = false;
      },
      onResponseError: (e) => {
        isPending.value = false;
        if (e.error?.name === 'AbortError') return;
        console.error('[chat res.err] ', e.error?.message);
        setError('Cannot process message');
      },
    });
  }

  return {
    isPending,
    hasError,
    errorMessage,
    setError,
    clearError,
    getMessages,
    postConversation,
  };
}
