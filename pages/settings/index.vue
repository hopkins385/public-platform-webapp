<script setup lang="ts">
  const config = useAppConfig();
  await navigateTo(config.nav.defaults.settings);
</script>

<template>
  <div>
    <NuxtLinkLocale :to="config.nav.defaults.settings" class="hover:underline">
      Redirecting to settings...
    </NuxtLinkLocale>
  </div>
</template>
