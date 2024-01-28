<script setup lang="ts">
  import { InfoIcon } from 'lucide-vue-next';

  defineProps<{
    text: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: 'hover' | 'click' | 'focus';
  }>();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <InfoIcon class="ml-2 size-3 stroke-1.5" />
      </TooltipTrigger>
      <TooltipContent>
        <p class="max-w-xs text-sm">{{ text }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
