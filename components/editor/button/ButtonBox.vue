<script setup lang="ts">
  defineProps<{
    active: boolean;
  }>();
</script>

<template>
  <button
    :class="{ 'text-indigo-600': active }"
    class="flex w-full items-center space-x-2 p-1 text-left"
  >
    <slot />
  </button>
</template>
