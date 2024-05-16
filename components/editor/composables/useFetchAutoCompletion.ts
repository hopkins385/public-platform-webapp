interface IAutocompletionPayload {
  input: string;
  context: string;
}

export default function useFetchAutoCompletion() {
  let isLoading = ref(false);

  async function fetchAutoCompletion(
    signal: AbortSignal,
    payload: IAutocompletionPayload,
  ) {
    const { input, context } = payload;

    isLoading.value = true;
    const response = await $fetch('/api/editor/auto-complete', {
      signal,
      method: 'POST',
      body: {
        lang: 'en',
        input,
      },
    });
    isLoading.value = false;
    const { completion } = response;
    return completion;
  }

  return {
    isLoading,
    fetchAutoCompletion,
  };
}
