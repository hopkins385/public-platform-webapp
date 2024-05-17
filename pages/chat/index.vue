<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat',
      label: 'Chat',
    },
  });
  const { getAllAssistants } = useManageAssistants();
  const { getRecentChatForUser, createChat } = useChat();
  const { data: chat } = await getRecentChatForUser();

  onMounted(async () => {
    if (!chat.value?.id) {
      const { data } = await getAllAssistants();
      const assistant = data.value.assistants[0];
      const newChat = await createChat(assistant.id);
      return await navigateTo(`/chat/${newChat.id}`);
    }
    return await navigateTo(`/chat/${chat.value.id}`);
  });
</script>

<template>
  <SectionContainer> </SectionContainer>
</template>
