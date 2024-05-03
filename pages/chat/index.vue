<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat',
      label: 'Chat',
    },
  });
</script>

<template>
  <SectionContainer class="h-full">
    <ChatWindow />
  </SectionContainer>
</template>
