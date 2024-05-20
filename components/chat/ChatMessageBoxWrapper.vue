<script setup lang="ts">
  defineProps<{
    displayName: string;
  }>();
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col space-y-2">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{ displayName }}
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
