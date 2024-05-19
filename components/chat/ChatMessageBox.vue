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
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col space-y-2">
        <div class="select-nonefont-semibold" style="padding-top: 1.5px">
          {{ displayName }}
        </div>
        <div v-if="visionContents?.length">
          <div v-for="(visionContent, index) in visionContents" :key="index">
            <img
              v-if="visionContent.type === 'image'"
              :src="visionContent.url"
              class="max-h-96 max-w-xl object-cover"
            />
          </div>
        </div>
        <div
          v-dompurify-html="parseMarkdown(content)"
          class="w-full pr-10"
        ></div>
      </div>
    </div>
  </div>
</template>
