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
  <SectionContainerWithImage>
    <ChatWindow />
  </SectionContainerWithImage>
</template>
