<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';
  import type { ChatMessageVisionContent } from '~/interfaces/chat.interfaces';

  defineProps<{
    type: 'text' | 'image' | 'video' | 'audio' | null | undefined;
    content: string;
    displayName: string;
    visionContents?: ChatMessageVisionContent[] | null;
  }>();

  const { parseMarkdown } = useMarkdown();
</script>

<template>
  <ChatMessageBoxWrapper :display-name="displayName">
    <div v-if="visionContents?.length">
      <div
        v-for="(visionContent, index) in visionContents"
        :key="index"
        class="max-h-96 max-w-xl overflow-hidden rounded-lg"
      >
        <img
          v-if="visionContent.type === 'image'"
          :src="visionContent.url"
          class="size-full rounded-lg object-cover"
          crossorigin=""
        />
      </div>
    </div>
    <div v-dompurify-html="parseMarkdown(content)" class="w-full pr-10"></div>
  </ChatMessageBoxWrapper>
</template>
