<script setup lang="ts">
  defineProps<{
    assistant?: any;
  }>();
</script>

<template>
  <div class="max-w-xs truncate text-sm xl:max-w-lg">
    <span class="opacity-50">{{ assistant?.title }}</span>
  </div>
</template>
