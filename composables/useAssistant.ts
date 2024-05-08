class AssistantDto {
  title: string = '';
  description: string = '';
  systemPrompt: string = '';
  isShared: boolean = false;
  systemPromptTokenCount: number = 0;
}

class UpdateAssistantDto extends AssistantDto {
  id: string = '';
}

export default function useManageAssistants() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let assistantId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setAssistantId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    assistantId = id;
  }

  function getAssistantDetails() {
    return useAsyncData(`assistantDetail:${assistantId}`, async () => {
      if (!assistantId) return;
      const assistant = await $client.assistant.details.query(
        { id: assistantId },
        {
          signal: ac.signal,
        },
      );
      return assistant;
    });
  }

  return {
    getAssistantDetails,

    setAssistantId,
  };
}
