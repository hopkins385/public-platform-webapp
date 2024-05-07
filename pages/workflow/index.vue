<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'workflows.meta.index.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'Workflows',
      label: 'Workflows',
    },
  });

  const filterProjectId = ref<string | undefined>(undefined);

  const { getAllWorkflowsForUser } = useManageWorkflows();
  const { data } = await getAllWorkflowsForUser();

  const { getAllProjects } = useManageProjects();
  const { data: projects } = await getAllProjects({ lazy: true });

  const allWorkflows = computed(() => data.value?.allWorkflows || []);
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
                :projects="projects"
              />
              <Button variant="ghost" @click="onClearProjectFilter">
                Clear Filter
              </Button>
            </div>
          </div>
          <Button
            class="self-end"
            variant="outline"
            @click="() => navigateTo(`/workflow/create`)"
          >
            New Workflow
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </Button>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      {{ allWorkflows }}
      <WorkflowListAll :meta="meta" :workflows="allWorkflows" />
    </BoxContainer>
  </SectionContainer>
</template>
