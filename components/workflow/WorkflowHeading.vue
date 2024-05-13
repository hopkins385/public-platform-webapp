<script setup lang="ts">
  import {
    PanelLeftIcon,
    PlusIcon,
    SquareGanttChartIcon,
    Table2Icon,
  } from 'lucide-vue-next';

  const props = defineProps<{
    projectWorkflows: { id: string; name: string }[];
    workflowId: string;
    projectId: string;
  }>();

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(props.workflowId);
  }
</script>

<template>
  <div>
    <div class="flex h-14 items-center justify-between border-b px-4 text-sm">
      <div class="flex items-center">
        <div class="mr-3 opacity-75">
          <PanelLeftIcon class="size-4 stroke-1.5" />
        </div>
        <div class="opacity-50">All Projects</div>
      </div>
      <div>
        <Button variant="outline" size="sm" class="text-xs">Export Data</Button>
      </div>
    </div>
    <div class="flex h-14 items-center border-b px-1 text-sm">
      <div class="hidden" @click="onPlayClick">
        <div
          class="mx-2 flex w-fit rounded-lg border bg-white px-3 py-2 text-xs"
        >
          <SquareGanttChartIcon class="mr-1 size-4 stroke-1.5" />
          <span class="font-bold">Run All</span>
        </div>
      </div>
      <div v-for="(workflow, index) in projectWorkflows">
        <NuxtLinkLocale
          :to="`/project/${projectId}/workflow/${workflow.id}`"
          class="mx-2 flex w-fit max-w-72 rounded-lg border px-3 py-2 text-xs"
          :class="{ '-mt-1 bg-white shadow-md': workflow.id === workflowId }"
        >
          <Table2Icon class="mr-1 size-4 stroke-1.5" />
          <span class="truncate whitespace-nowrap font-bold">
            {{ workflow.name }}
          </span>
        </NuxtLinkLocale>
      </div>
      <div class="opacity-60 hover:opacity-100">
        <NuxtLinkLocale
          :to="`/project/${projectId}/workflow/create`"
          class="group mx-2 flex w-fit cursor-pointer rounded-lg border border-transparent px-3 py-2 text-xs hover:border-slate-300"
        >
          <PlusIcon class="mr-1 size-4 stroke-1.5" />
          <span class="whitespace-nowrap">Add Workflow</span>
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>
