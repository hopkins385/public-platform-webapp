<script setup lang="ts">
  /**
   * Radix-Vue Nuxt Hydration Mismatch Workaround
   */
  import { ConfigProvider } from 'radix-vue';
  const useIdFunction = () => useId();
</script>
<template>
  <ConfigProvider :use-id="useIdFunction">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ConfigProvider>
</template>
