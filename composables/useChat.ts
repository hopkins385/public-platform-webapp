import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

export default function useChat() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  const page = ref<number>(1);
  const searchQuery = ref<string>('');

  onScopeDispose(() => {
    ac.abort();
  });

  const setSearchQuery = useDebounceFn((newSearchQuery: string) => {
    searchQuery.value = newSearchQuery;
  }, 300);

  function setPage(newPage: number) {
    page.value = newPage;
  }

  async function createChat(assistantId: string) {
    return await $client.chat.create.query(
      {
        assistantId,
      },
      {
        signal: ac.signal,
      },
    );
  }

  function getAllChatsForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      'allChats',
      async () => {
        const [chats, meta] = await $client.chat.allForUserPaginate.query(
          {
            page: page.value,
            searchQuery: searchQuery.value,
          },
          {
            signal: ac.signal,
          },
        );
        return { chats, meta };
      },
      {
        watch: [page, searchQuery],
        ...options,
      },
    );
  }

  function getChatForUser(chatId: string, options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `chat:${chatId}`,
      async () => {
        return await $client.chat.forUser.query(
          {
            chatId,
          },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  function getRecentChatForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      'recentChat',
      async () => {
        return await $client.chat.recentForUser.query(undefined, {
          signal: ac.signal,
        });
      },
      options,
    );
  }

  function deleteChat(chatId: string, options: AsyncDataOptions<any> = {}) {
    return $client.chat.delete.query(
      { chatId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    page,
    searchQuery,
    setPage,
    setSearchQuery,
    createChat,
    getChatForUser,
    getAllChatsForUser,
    getRecentChatForUser,
    deleteChat,
  };
}
