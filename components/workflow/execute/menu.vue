<script setup lang="ts">
  import { ChevronDownIcon, CircleChevronRight, RotateCcwIcon, SettingsIcon } from 'lucide-vue-next';

  const props = defineProps<{
    projectId: string;
    workflowId: string;
  }>();

  defineEmits<{
    play: [void];
    reload: [void];
  }>();

  const toSettingsLink = computed(() => `/projects/${props.projectId}/workflows/${props.workflowId}/settings`);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <div class="rounded-lg border p-1">
        <ChevronDownIcon class="size-3 stroke-1.5" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" :avoid-collisions="true" :loop="true" class="w-48 p-2">
      <DropdownMenuLabel class="text-xs">Workflow</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="w-full cursor-pointer text-xs" @click="$emit('reload')" as="button">
        <RotateCcwIcon class="mr-1 size-3 stroke-1.5" />
        Reload data
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="w-full cursor-pointer text-xs" @click="$emit('play')" as="button">
        <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
        Run all steps
      </DropdownMenuItem>
      <DropdownMenuItem class="w-full cursor-pointer text-xs" :disabled="true" as="button">
        <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
        Run empty cells
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-xs">
        <NuxtLinkLocale :to="toSettingsLink" class="flex w-full items-center">
          <SettingsIcon class="mr-1 size-3 stroke-1.5" />
          Settings
        </NuxtLinkLocale>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
