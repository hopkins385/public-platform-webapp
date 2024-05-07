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
    class="flex h-full items-center border-0 transition-colors hover:text-foreground"
    :class="active ? 'nav-link-active' : ''"
  >
    <component :is="icon" class="nav-icon" />
    <span
      class="truncate px-4"
      :class="labelVisible ? 'block opacity-100' : 'hidden opacity-0'"
    >
      {{ label }}
    </span>
  </NuxtLinkLocale>
</template>

<style scoped>
  .nav-icon {
    @apply size-5 shrink-0 fill-slate-100 stroke-1.5;
  }

  .nav-link-active {
    @apply font-semibold;
  }
</style>
