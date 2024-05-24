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
  <div class="h-full">
    <ErrorAlertStatic v-if="error" type="error" :message="error.message" />
    <div class="flex h-full">
      <!-- ChatSideBar /-->
      <ChatNewModal />
      <ChatWindow v-if="chat" :chat-id="chat?.id" :chat-messages="chat?.messages" :assistant="chat?.assistant" />
    </div>
  </div>
</template>
