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

  onMounted(async () => {
    if (!chat.value?.id) {
      return await navigateTo('/assistant');
    }
    return await navigateTo(`/chat/${chat.value.id}`);
  });
</script>

<template>
  <SectionContainer class="h-full"> </SectionContainer>
</template>
