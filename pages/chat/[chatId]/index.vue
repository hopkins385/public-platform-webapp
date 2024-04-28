<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.index.title',
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
  <SectionContainerWithImage>
    <ErrorAlertStatic v-if="error" type="error" :message="error.message" />
    <ChatWindow
      v-if="chat"
      :chat-id="chat?.id"
      :chat-messages="chat?.messages"
      :assistant="chat?.assistant"
    />
  </SectionContainerWithImage>
</template>
