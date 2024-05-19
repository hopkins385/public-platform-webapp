<script setup lang="ts">
  defineProps<{
    chunk: string;
    assistantName?: string;
  }>();

  const { parseMarkdown } = useMarkdown();
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{ assistantName ?? $t('assistant.placeholder') }}
        </div>
        <div v-dompurify-html="parseMarkdown(chunk)" class="w-full pr-10"></div>
      </div>
    </div>
  </div>
</template>
