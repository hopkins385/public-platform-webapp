<script setup lang="ts">
  import { InfoIcon } from 'lucide-vue-next';
  defineProps<{
    title: string;
    content: string;
  }>();

  const boundaryElement = document.getElementById('main') as HTMLElement;
</script>

<template>
  <TooltipProvider :delay-duration="250">
    <Tooltip>
      <TooltipTrigger class="cursor-default">
        <InfoIcon class="size-3 text-primary/70" />
      </TooltipTrigger>
      <TooltipContent
        align="end"
        side="left"
        class="max-w-xs p-4"
        :avoid-collisions="true"
        :collision-padding="{ top: 10 }"
        :collision-boundary="boundaryElement"
      >
        <h3 class="pb-2 font-semibold">{{ title }}</h3>
        <p class="text-sm">{{ content }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
