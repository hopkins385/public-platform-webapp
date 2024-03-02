<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';
  defineProps<{
    message: string;
    role: 'user' | 'assistant';
  }>();
</script>

<template>
  <div
    class="chatbox__text-box rounded-lg border-0 bg-white px-10 py-5 text-sm"
  >
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{
            role == 'user'
              ? $t('user.placeholder')
              : $t('assistant.placeholder')
          }}
        </div>
        <div v-dompurify-html="message" class="w-full pr-10"></div>
      </div>
    </div>
  </div>
</template>
