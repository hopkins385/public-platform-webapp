<script setup lang="ts">
  defineProps<{
    textVisible: boolean;
  }>();
</script>

<template>
  <NuxtLinkLocale href="/">
    <div class="flex h-8 items-center justify-center space-x-3">
      <span class="opacity-95">
        <IconRagna class="size-7 drop-shadow-sm" />
      </span>
      <span v-if="textVisible" class="text-sm opacity-75">RAGNA Cloud</span>
    </div>
  </NuxtLinkLocale>
</template>
