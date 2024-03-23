export interface EditorCompletionPayload {
  lang: string;
  action: string;
  selectedText: string;
  fullText: string;
  prompt: string;
}

export default function useEditorCompletion() {
  const isLoading = ref(false);
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  async function getEditorCompletion(payload: EditorCompletionPayload) {
    isLoading.value = true;
    const response = await $fetch('/api/editor/completion', {
      signal: ac.signal,
      method: 'POST',
      body: {
        lang: payload.lang,
        action: payload.action,
        selectedText: payload.selectedText,
        fullText: payload.fullText,
        prompt: payload.prompt,
      },
    });
    isLoading.value = false;
    return response;
  }

  return {
    isLoading,
    getEditorCompletion,
  };
}
