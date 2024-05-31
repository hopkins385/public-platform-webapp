<script setup lang="ts">
  import { ChevronDownIcon, CircleChevronRight, RotateCcwIcon, SettingsIcon } from 'lucide-vue-next';

  const props = defineProps<{
    projectId: string;
    workflowId: string;
  }>();

  defineEmits<{
    'run-selected': [void];
    'run-all': [void];
    'run-empty': [void];
    'reload-sheet': [void];
  }>();

  const toSettingsLink = computed(() => `/projects/${props.projectId}/workflows/${props.workflowId}/settings`);

  const open = ref(false);
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger>
      <div
        class="flex items-center justify-center space-x-2 rounded-lg border px-3 py-2 hover:bg-white"
        :class="{ 'bg-white shadow-md': open }"
      >
        <span class="text-xs font-semibold">Menu</span>
        <ChevronDownIcon class="size-4 stroke-1.5" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" :avoid-collisions="true" :loop="true" class="w-48 p-2">
      <DropdownMenuLabel class="text-xs">Workflow</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="w-full cursor-pointer text-xs" @click="$emit('reload-sheet')" as="button">
        <RotateCcwIcon class="mr-1 size-3 stroke-1.5" />
        Reload data
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <!-- DropdownMenuItem class="w-full cursor-pointer text-xs" @click="$emit('run-selected')" as="button">
        <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
        Run selected
      </!-->
      <DropdownMenuItem class="w-full cursor-pointer text-xs" @click="$emit('run-all')" as="button">
        <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
        Run all
      </DropdownMenuItem>
      <!-- DropdownMenuItem class="w-full cursor-pointer text-xs" :disabled="true" @click="$emit('run-empty')" as="button">
        <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
        Run empty
      </!-->
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
