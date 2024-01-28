<script setup lang="ts">
  import { Loader2Icon } from 'lucide-vue-next';
  defineProps<{
    isLoading: boolean;
    disabled?: boolean;
    variant?:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'link'
      | 'outline'
      | 'ghost'
      | null
      | undefined;
    type?: 'button' | 'submit' | 'reset';
  }>();
</script>

<template>
  <Button
    :variant="variant"
    :disabled="disabled || isLoading"
    :type="type"
    class="space-x-2"
  >
    <span v-if="isLoading" class="animate-spin">
      <Loader2Icon class="size-4" />
    </span>
    <span>
      <slot />
    </span>
  </Button>
</template>
