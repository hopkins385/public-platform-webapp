<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat',
      label: 'Chat',
    },
  });

  const { getRecentChatForUser } = useChat();
  const { data: chat } = await getRecentChatForUser();

  if (!chat.value?.id) {
    navigateTo('/chat/new');
  } else {
    navigateTo(`/chat/${chat.value.id}`);
  }
</script>

<template>
  <SectionContainer class="h-full"> </SectionContainer>
</template>
