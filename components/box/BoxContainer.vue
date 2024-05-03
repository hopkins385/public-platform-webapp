<script setup lang="ts">
  defineProps<{
    noPadding?: boolean;
  }>();
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border bg-white p-10"
    :class="{
      '!p-0': noPadding === true,
    }"
  >
    <slot />
  </div>
</template>
