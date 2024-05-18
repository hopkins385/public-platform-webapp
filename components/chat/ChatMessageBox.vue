<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';
  import type {
    ChatMessage,
    VisionChatMessage,
  } from '~/interfaces/chat.interfaces';

  const props = defineProps<{
    message: ChatMessage | VisionChatMessage;
    assistantName?: string;
  }>();

  const { render } = useMarkdown();

  const isVisionMessage = computed(() => {
    return Array.isArray(props.message.content);
  });

  const htmlContent = computed(() => {
    if (isVisionMessage.value) {
      const { content } = props.message as VisionChatMessage;
      return content
        .map((visionContent) => {
          if (visionContent.type === 'image_url') {
            return `<img src="${visionContent.image_url.url}" alt="Input Image" class="w-full p-5" />`;
          } else {
            return render(visionContent.text);
          }
        })
        .join('');
    } else {
      const { content } = props.message as ChatMessage;
      return render(content);
    }
  });
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{
            message?.role == 'user'
              ? $t('user.placeholder')
              : assistantName ?? $t('assistant.placeholder')
          }}
        </div>
        <div v-dompurify-html="htmlContent" class="w-full pr-10"></div>
      </div>
    </div>
  </div>
</template>
