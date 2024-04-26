<script setup lang="ts">
  /**
   * Project Workflows Index - List all workflows of this project
   * Route: /project/${projectId}
   */
  definePageMeta({
    title: 'workflow.meta.index.title',
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { projectId } = useRoute().params;
  const { getProject } = useManageProjects();
  const { data: projectData } = await getProject(projectId, { lazy: true });
</script>

<template>
  <SectionContainerWithImage>
    <BoxContainer class="-mt-6 mb-4 py-5">
      <div class="text-xl font-semibold">
        Workflows - {{ projectData?.name }}
      </div>
    </BoxContainer>
    <BoxContainer>
      <Suspense>
        <WorkflowProjectTable :project-id="projectId" />
        <template #fallback>
          <div>Loading ...</div>
        </template>
      </Suspense>
    </BoxContainer>
  </SectionContainerWithImage>
</template>
