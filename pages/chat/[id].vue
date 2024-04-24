<script setup lang="ts">
  definePageMeta({
    validate: (route) => {
      const { isValidRouteUlid } = useRouteValidation();
      return isValidRouteUlid(route.params);
    },
  });

  const { $client } = useNuxtApp();
  const route = useRoute();
  const { id } = route.params;
  const chatId = Array.isArray(id) ? id[0] : id;

  const chat = await $client.chat.forUser.query({
    chatId,
  });
  if (!chat || !chat.id) {
    navigateTo('/404');
  }
</script>

<template>
  <SectionContainerWithImage>
    <ChatWindow
      :chat-id="chat?.id"
      :chat-messages="chat?.messages"
      :assistant="chat?.assistant"
    />
  </SectionContainerWithImage>
</template>
