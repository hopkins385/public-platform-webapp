<script setup lang="ts">
  definePageMeta({
    title: 'workflow.meta.index.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'Workflows',
      label: 'Workflows',
    },
  });

  const filterProjectId = ref<string | undefined>(undefined);

  const { getAllWorkflowsForUser } = useManageWorkflows();
  // attention, in this case we want to pass the ref directly and not the value
  const { data } = await getAllWorkflowsForUser(filterProjectId, {
    watch: [filterProjectId],
  });

  const workflows = computed(
    () => data.value?.allWorkflows.flatMap((w: any) => w.workflows) || [],
  );
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function onClearProjectFilter() {
    filterProjectId.value = undefined;
  }

  async function onUpdateProjectFilter(value: string) {
    filterProjectId.value = value;
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Workflows"
      subtitle="Create, edit, and manage workflows"
    />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div>
            <div class="mb-1 p-1 text-xs font-semibold">Filter</div>
            <div class="flex space-x-2">
              <ProjectSelect
                :projectId="filterProjectId"
                @update:projectId="onUpdateProjectFilter"
              />
              <Button
                class="whitespace-nowrap"
                variant="ghost"
                @click="onClearProjectFilter"
              >
                Clear Filter
              </Button>
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
