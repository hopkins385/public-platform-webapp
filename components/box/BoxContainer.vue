<script setup lang="ts">
  defineProps<{
    noPadding?: boolean;
  }>();
</script>

<template>
  <div class="overflow-hidden rounded-xl border bg-white p-10">
    <slot />
  </div>
</template>
