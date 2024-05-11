<script setup lang="ts">
  defineProps<{
    to: string;
    variant?:
      | 'outline'
      | 'default'
      | 'link'
      | 'destructive'
      | 'secondary'
      | 'ghost'
      | null
      | undefined;
  }>();
</script>

<template>
  <Button :variant="variant ?? 'outline'" as-child>
    <NuxtLinkLocale :to="to">
      <slot />
    </NuxtLinkLocale>
  </Button>
</template>
