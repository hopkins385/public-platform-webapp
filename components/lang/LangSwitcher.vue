<script setup lang="ts">
  const { locale, locales, setLocale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();
  const availableLocales = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value);
  });
</script>

<template>
  <div class="absolute right-3 top-2">
    <NuxtLink
      v-for="lang in availableLocales"
      :key="lang.code"
      :to="switchLocalePath(lang.code)"
      class="text-sm opacity-50"
      @click.prevent.stop="() => setLocale(lang.code)"
    >
      {{ lang.name }}
    </NuxtLink>
  </div>
</template>
