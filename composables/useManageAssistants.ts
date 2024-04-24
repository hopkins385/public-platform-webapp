class AssistantDto {
  teamId: string = '';
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

  let page: number = 1;
  let assistantId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setAssistantId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    assistantId = id;
  }

  function createAssistant(payload: AssistantDto) {
    return $client.assistant.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getAllAssistants() {
    return useAsyncData(async () => {
      const [assistants, meta] = await $client.assistant.all.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { assistants, meta };
    });
  }

  function getOneAssistant() {
    return useAsyncData(async () => {
      if (!assistantId) return;
      const assistant = await $client.assistant.one.query(
        { id: assistantId },
        {
          signal: ac.signal,
        },
      );
      return assistant;
    });
  }

  function updateAssistant(payload: UpdateAssistantDto) {
    return $client.assistant.update.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteAssistant(id: string, teamId: string) {
    return $client.assistant.delete.mutate(
      { id, teamId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    createAssistant,
    updateAssistant,
    getAllAssistants,
    getOneAssistant,
    deleteAssistant,
    setAssistantId,
    setPage,
  };
}
