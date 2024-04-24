<script setup lang="ts">
  const props = defineProps<{
    assistant?: any;
  }>();
</script>

<template>
  <div class="max-w-56 px-2 pt-4 text-sm opacity-70">
    <span>{{ $t('assistant.placeholder') }}:</span>
    <p class="break-all pt-1">
      {{ assistant?.title }}
    </p>
  </div>
</template>
