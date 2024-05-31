<script setup lang="ts">
  import { GitPullRequestArrowIcon, Loader2Icon, PanelLeftIcon, PlusIcon, Table2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    projectWorkflows: { id: string; name: string }[];
    workflowId: string;
    projectId: string;
    showTableView: boolean;
  }>();

  const emit = defineEmits<{
    'update:showTableView': [boolean];
  }>();

  const exportIsLoading = ref(false);
  const navBar = useNavBarStore();
  const projectStore = useProjectStore();
  const { executeWorkflow } = useExecuteWorkflow();
  const { exportWorkflow } = useManageWorkflows();

  // const cacheKey = computed(() => `workflow:${props.workflowId}`);
  const { data: workflow } = useNuxtData(`workflow:${props.workflowId}`);

  function onTableViewClick() {
    emit('update:showTableView', true);
  }

  function onFlowViewClick() {
    emit('update:showTableView', false);
  }

  async function onRunAll() {
    const res = await executeWorkflow(props.workflowId);
  }

  async function onReloadSheet() {
    const toast = useToast();
    // await refresh();
    // toast.success({ description: 'Data reloaded' });
  }

  async function onExportData() {
    exportIsLoading.value = true;
    try {
      const response = await exportWorkflow(props.workflowId);
      if (!response || !response?._data) {
        throw new Error('No data found');
      }

      const blob = new Blob([response?._data as unknown as Blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.workflowId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
    }
    exportIsLoading.value = false;
  }
</script>

<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="flex h-14 items-center justify-between border-b px-4 text-sm">
      <div class="flex items-center">
        <button class="mr-3 opacity-75" @click="() => navBar.toggleFullClosed()">
          <PanelLeftIcon class="size-4 stroke-1.5" />
        </button>
        <NuxtLinkLocale :to="`/projects/${projectStore.activeProjectId}`" class="opacity-50">
          Workflows
        </NuxtLinkLocale>
        <span class="mx-2 opacity-50">/</span>
        <span class="opacity-70">
          {{ workflow?.project.name }}
        </span>
      </div>
      <div class="space-x-2">
        <Button variant="outline" size="sm" class="text-xs" @click="onExportData" :disabled="exportIsLoading">
          <span v-if="exportIsLoading" class="mr-1">
            <Loader2Icon class="size-3 animate-spin stroke-1.5" />
          </span>
          Export Data
        </Button>
      </div>
    </div>
    <!-- Project Workflows -->
    <div class="flex h-14 items-center justify-between border-b px-1 text-sm">
      <div class="no-scrollbar flex items-center overflow-y-scroll">
        <div v-for="(workflow, index) in projectWorkflows" class="py-2">
          <NuxtLinkLocale
            :to="`/projects/${projectId}/workflows/${workflow.id}`"
            class="mx-2 flex max-w-72 rounded-lg border px-3 py-2 text-xs"
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
            :to="`/projects/${projectId}/workflows/create`"
            class="group mx-2 flex w-fit cursor-pointer rounded-lg border border-transparent px-3 py-2 text-xs hover:border-slate-300"
          >
            <PlusIcon class="mr-1 size-4 stroke-1.5" />
            <span class="whitespace-nowrap">Add Workflow</span>
          </NuxtLinkLocale>
        </div>
      </div>
      <!-- Control Section -->
      <div class="flex px-4">
        <div class="mr-2 flex rounded-lg">
          <WorkflowExecuteMenu
            :projectId="projectId"
            :workflowId="workflowId"
            @run-all="onRunAll"
            @reload-sheet="onReloadSheet"
          />
        </div>
        <div class="flex items-center space-x-1 rounded-lg bg-stone-200/60" style="padding: 0.2rem">
          <button
            class="flex size-7 items-center justify-center rounded-lg"
            :class="{ 'border bg-white shadow-sm': showTableView }"
            @click="() => onTableViewClick()"
          >
            <Table2Icon class="size-3 stroke-1" />
          </button>
          <button
            class="flex size-7 items-center justify-center rounded-lg"
            :class="{ 'border bg-white shadow-sm': !showTableView }"
            @click="() => onFlowViewClick()"
          >
            <GitPullRequestArrowIcon class="size-3 stroke-1.5 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
