<script setup lang="ts">
  definePageMeta({
    title: 'workflow.meta.index.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'Workflows',
      label: 'Workflows',
    },
  });

  const { getAllWorkflowsForUser, setProjectId, projectId: selectedProjectId } = useManageWorkflows();

  const projectStore = useProjectStore();
  setProjectId(projectStore.activeProjectId);

  const { data } = await getAllWorkflowsForUser();

  const workflows = computed(() => data.value?.allWorkflows.flatMap((w: any) => w.workflows) || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function onClearProjectFilter() {
    setProjectId(null);
  }

  async function onUpdateProjectFilter(value: string) {
    setProjectId(value);
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Workflows" subtitle="Create, edit, and manage workflows" />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div>
            <div class="mb-1 p-1 text-xs font-semibold">Filter</div>
            <div class="flex space-x-2">
              <ProjectSelect
                :key="selectedProjectId"
                :projectId="selectedProjectId"
                @update:projectId="onUpdateProjectFilter"
              />
              <Button class="whitespace-nowrap" variant="ghost" @click="onClearProjectFilter"> Clear Filter </Button>
            </div>
          </div>
          <!-- LinkButton class="self-end" to="/workflow/create">
            New Workflow
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </!-->
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <WorkflowListAll :meta="meta" :workflows="workflows" />
    </BoxContainer>
  </SectionContainer>
</template>
