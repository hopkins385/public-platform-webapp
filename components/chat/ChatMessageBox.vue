<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';
  import type { ChatMessage } from '~/interfaces/chat.interfaces';

  defineProps<{
    message: ChatMessage;
    assistantName?: string;
  }>();

  const { parseMarkdown } = useMarkdown();

  /*function getContent(data: ChatMessage) {
    if (Array.isArray(data.message)) {
      const visionContent = data.message;
      if (!visionContent) return '';
      return visionContent
        .map((vc) => {
          if (vc.type === 'image_url') {
            return `<img src="${vc.image_url.url}" alt="Input Image" class="min-h-52 max-h-96 object-cover py-5" />`;
          } else {
            return vc.text;
          }
        })
        .join('');
    } else {
      const content = data.message?.content;
      if (!content) return '';
      return content;
    }
  }*/
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{
            message.role == 'user'
              ? $t('user.placeholder')
              : assistantName ?? $t('assistant.placeholder')
          }}
        </div>
        <div
          v-dompurify-html="parseMarkdown(message.content)"
          class="w-full pr-10"
        ></div>
      </div>
    </div>
  </div>
</template>
