import type { AsyncDataOptions } from '#app';

export default function useChat() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  let page = 1;

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(newPage: number) {
    page = newPage;
  }

  function getAllChatsForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(async () => {
      const [chats, meta] = await $client.chat.allForUserPaginate.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { chats, meta };
    }, options);
  }

  function getChatForUser(chatId: string, options: AsyncDataOptions<any> = {}) {
    return useAsyncData(async () => {
      return await $client.chat.forUser.query(
        {
          chatId,
        },
        {
          signal: ac.signal,
        },
      );
    }, options);
  }

  function getRecentChatForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(async () => {
      return await $client.chat.recentForUser.query(undefined, {
        signal: ac.signal,
      });
    }, options);
  }

  function deleteChat(chatId: string, options: AsyncDataOptions<any> = {}) {
    return useAsyncData(async () => {
      return await $client.chat.delete.query(
        { chatId },
        {
          signal: ac.signal,
        },
      );
    }, options);
  }

  return {
    getChatForUser,
    getAllChatsForUser,
    getRecentChatForUser,
    deleteChat,
    setPage,
  };
}
