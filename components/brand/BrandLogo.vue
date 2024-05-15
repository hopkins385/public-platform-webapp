<script setup lang="ts">
  defineProps<{
    textVisible: boolean;
  }>();
</script>

<template>
  <NuxtLinkLocale href="/">
    <div class="flex h-8 items-center justify-center space-x-3">
      <div class="opacity-100">
        <IconRagna class="size-7 drop-shadow-sm" />
      </div>
      <div v-if="textVisible" class="text-sm opacity-95">
        <span class="font-semibold tracking-wide">RAGNA</span> Cloud
      </div>
    </div>
  </NuxtLinkLocale>
</template>
