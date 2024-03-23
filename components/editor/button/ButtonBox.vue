<script setup lang="ts">
  defineProps<{
    active: boolean;
  }>();
</script>

<template>
  <button
    :class="{ 'text-indigo-600': active }"
    class="flex w-full shrink-0 items-center space-x-2 text-left"
  >
    <slot />
  </button>
</template>
