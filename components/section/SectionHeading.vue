<script setup lang="ts">
  defineProps<{
    title: string | undefined | null;
    subtitle?: string;
  }>();
</script>

<template>
  <div class="flex items-center justify-between px-5 pb-8">
    <div>
      <h1 class="text-2xl font-bold">{{ title ?? '' }}</h1>
      <p class="text-sm text-gray-500">
        {{ subtitle ?? '' }}
      </p>
    </div>
    <div>
      <slot name="button" />
    </div>
  </div>
</template>
