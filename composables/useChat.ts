export default function useChat() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

  function getAllChatsForUser(page: number = 1) {
    return useAsyncData(async () => {
      const [chats, meta] = await $client.chat.allForUserPaginate.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { chats, meta };
    });
  }

  function deleteChat(chatId: string) {
    return useAsyncData(async () => {
      return await $client.chat.delete.query(
        { chatId },
        {
          signal: ac.signal,
        },
      );
    });
  }

  return {
    getAllChatsForUser,
    deleteChat,
  };
}
