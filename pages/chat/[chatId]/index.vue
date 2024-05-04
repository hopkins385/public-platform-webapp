<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.index.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat Conversation',
      label: 'Conversation',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidChatId(route.params);
    },
  });

  const { chatId } = useRoute().params;

  const { getChatForUser } = useChat();
  const { data: chat, error } = await getChatForUser(chatId as string);

  if (!chat.value) {
    await navigateTo('/404');
  }
</script>

<template>
  <div class="h-full py-10 pl-5 pr-10" style="max-height: calc(100vh - 65px)">
    <ErrorAlertStatic v-if="error" type="error" :message="error.message" />
    <div class="flex h-full space-x-4">
      <ChatSideBar />
      <ChatWindow
        v-if="chat"
        :chat-id="chat?.id"
        :chat-messages="chat?.messages"
        :assistant="chat?.assistant"
      />
    </div>
  </div>
</template>
