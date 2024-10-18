<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { ClipboardCheckIcon, ClipboardIcon } from 'lucide-vue-next';

  defineProps<{
    prompt: string;
  }>();

  const promptCopy = ref('');
  const {
    copy: copyToClipboard,
    copied: copiedToClipboard,
    isSupported: copyToClipboardSupported,
  } = useClipboard({ source: promptCopy });
</script>

<template>
  <div class="image-prompt">
    <p class="text-sm">{{ prompt }}</p>
    <button class="absolute bottom-0 right-0 p-1 text-xs opacity-75 hover:opacity-100" @click="copyToClipboard(prompt)">
      <div v-if="copyToClipboardSupported">
        <ClipboardIcon v-if="!copiedToClipboard" class="size-4 stroke-1.5" />
        <ClipboardCheckIcon v-else class="size-4 stroke-1.5" />
      </div>
    </button>
  </div>
</template>

<style scoped>
  .image-prompt {
    position: relative;
    color: white;
  }
</style>
