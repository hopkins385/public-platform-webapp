<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';
  import type { ChatMessageVisionContent } from '~/interfaces/chat.interfaces';

  defineProps<{
    type: 'text' | 'image' | 'video' | 'audio' | null | undefined;
    content: string;
    displayName: string;
    visionContents?: ChatMessageVisionContent[];
  }>();

  const { parseMarkdown } = useMarkdown();
</script>

<template>
  <ChatMessageBoxWrapper :displayName="displayName">
    <div v-if="visionContents?.length">
      <div
        v-for="(visionContent, index) in visionContents"
        :key="index"
        class="overflow-hidden rounded-lg"
      >
        <img
          v-if="visionContent.type === 'image'"
          :src="visionContent.url"
          class="max-h-96 max-w-xl rounded-lg object-cover py-2"
          crossorigin=""
        />
      </div>
    </div>
    <div v-dompurify-html="parseMarkdown(content)" class="w-full pr-10"></div>
  </ChatMessageBoxWrapper>
</template>
