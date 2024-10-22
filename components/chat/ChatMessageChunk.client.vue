<script setup lang="ts">
  defineProps<{
    chunk: string;
    assistantName?: string;
  }>();

  const { parseMarkdown } = useMarkdown();
</script>

<template>
  <ChatMessageBoxWrapper :display-name="assistantName ?? $t('assistant.placeholder')">
    <div v-dompurify-html="parseMarkdown(chunk)" class="w-full pr-10"></div>
  </ChatMessageBoxWrapper>
</template>
