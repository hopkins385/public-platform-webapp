<script setup lang="ts">
  defineProps<{
    active: Boolean;
    to: string;
    icon: any;
    label: string;
    labelVisible: Boolean;
  }>();
</script>

<template>
  <NuxtLinkLocale
    :to="to"
    class="flex items-center rounded-lg border border-transparent px-4 py-2 transition-colors hover:border-muted-foreground/25"
    :class="active ? 'nav-link-active' : ''"
  >
    <component :is="icon" class="nav-icon default-icon" />
    <span
      class="truncate px-4 text-foreground"
      :class="labelVisible ? 'block opacity-100' : 'hidden opacity-0'"
    >
      {{ label }}
    </span>
  </NuxtLinkLocale>
</template>

<style scoped>
  .nav-icon {
    @apply size-5;
  }

  .nav-link-active {
    @apply font-semibold;
  }
</style>
