<script setup lang="ts">
  /**
   * Project Workflows Index - List all workflows of this project
   * Route: /projects/${projectId}
   */
  import { FileTextIcon, PlusIcon, WorkflowIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'workflow.meta.index.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Project',
      label: '...',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { projectId } = useRoute().params;
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="ml-auto flex flex-col space-y-1 self-end px-3 pb-2 pt-14">
          <LinkButton :to="`/projects/${projectId}/workflows/create`">
            New Workflow
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </LinkButton>
        </div>
      </template>
    </Heading>
    <BoxContainer class="mb-4 py-5 text-muted-foreground">
      <div class="text-sm">
        <ul class="flex space-x-2">
          <li class="">
            <div class="flex items-center justify-center space-x-1">
              <span>
                <WorkflowIcon class="default-icon size-4" />
              </span>
              <NuxtLinkLocale :to="`/projects/${projectId}`" class="border-b-2"> Workflows </NuxtLinkLocale>
            </div>
          </li>
          <li>|</li>
          <li>
            <div class="flex items-center justify-center space-x-1">
              <span>
                <FileTextIcon class="default-icon size-4" />
              </span>
              <NuxtLinkLocale to="/documents"> Documents </NuxtLinkLocale>
            </div>
          </li>
        </ul>
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
  </SectionContainer>
</template>
