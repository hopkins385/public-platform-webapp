<script setup lang="ts">
  import { Table2Icon } from 'lucide-vue-next';
  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  definePageMeta({
    title: 'workflow.meta.full.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Workflow',
      label: 'Active Workflow',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });

  const { projectId, workflowId } = useRoute().params;
  const { getProjectWorkflows } = useManageWorkflows();
  const { data } = await getProjectWorkflows(projectId as string);
  const projectWorkflows = computed(() =>
    data.value.workflows.map((w: any) => {
      return { id: w.id, name: w.name };
    }),
  );
</script>

<template>
  <div class="h-screen">
    <div class="flex h-14 items-center border-b px-4 text-sm">
      <span class="opacity-50">All Projects</span>
    </div>
    <div class="flex h-14 items-center border-b px-4 text-sm">
      <div v-for="(workflow, index) in projectWorkflows">
        <NuxtLinkLocale
          :to="`/project/${projectId}/workflow/${workflow.id}`"
          class="mx-2 -mt-1 flex w-fit rounded-lg border bg-white px-3 py-2 text-xs shadow-md"
          v-if="workflowId === workflow.id"
        >
          <Table2Icon class="mr-1 size-4 stroke-1.5" />
          <span class="font-bold"> {{ workflow.name }}</span>
        </NuxtLinkLocale>
        <NuxtLinkLocale
          :to="`/project/${projectId}/workflow/${workflow.id}`"
          class="mx-2 flex w-fit rounded-lg border px-3 py-2 text-xs"
          v-else
        >
          <Table2Icon class="mr-1 size-4 stroke-1.5" />
          <span class="font-bold"> {{ workflow.name }}</span>
        </NuxtLinkLocale>
      </div>
    </div>
    <div class="h-full bg-white">
      <Suspense>
        <WorkflowSheet :workflow-id="workflowId as string" />
      </Suspense>
    </div>
  </div>
</template>
