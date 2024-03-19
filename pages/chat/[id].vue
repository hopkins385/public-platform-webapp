<script setup lang="ts">
  definePageMeta({
    validate: (route) => {
      const { isValidRouteUlid } = useRouteValidation();
      return isValidRouteUlid(route.params);
    },
  });

  const { $client } = useNuxtApp();
  const route = useRoute();
  const chat = await $client.chat.forUser.query({
    chatId: route.params?.id,
  });
  if (!chat || !chat.id) {
    navigateTo('/404');
  }
</script>

<template>
  <SectionContainerWithImage>
    <ChatWindow :chat-id="chat?.id" :chat-messages="chat?.messages" />
  </SectionContainerWithImage>
</template>
