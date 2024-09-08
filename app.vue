<script setup lang="ts">
  /**
   * Radix-Vue Nuxt Hydration Mismatch Workaround
   * Update: 2024-05-08, seems to be fixed in Nuxt 3.13.1
   */
  import { ConfigProvider } from 'radix-vue';
  //  const useIdFunction = () => useId();
  // :use-id="useIdFunction"
</script>
<template>
  <ConfigProvider>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ConfigProvider>
</template>
