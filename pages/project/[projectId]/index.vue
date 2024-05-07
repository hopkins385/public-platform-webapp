<script setup lang="ts">
  import {
    FileTextIcon,
    PlusIcon,
    TextIcon,
    WorkflowIcon,
  } from 'lucide-vue-next';

  /**
   * Project Workflows Index - List all workflows of this project
   * Route: /project/${projectId}
   */

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

  const route = useRoute();

  const { data: auth } = useAuth();
  const { projectId } = useRoute().params;
  const { getProject } = useManageProjects();
  const { data: projectData } = await getProject(projectId);

  route.meta.breadcrumb.label = projectData.value?.name;
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="ml-auto flex flex-col space-y-1 self-end px-3 pb-2 pt-14">
          <Button
            variant="outline"
            @click="() => navigateTo(`/project/${projectId}/workflow/create`)"
          >
            New Workflow
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </Button>
        </div>
      </template>
    </Heading>
    <BoxContainer class="mb-4 py-5 text-muted-foreground">
      <div class="text-sm">
        <ul class="flex space-x-2">
          <li class="">
            <div class="flex items-center justify-center space-x-1">
              <span>
                <WorkflowIcon class="size-4" />
              </span>
              <NuxtLinkLocale :to="`/project/${projectId}`" class="border-b-2"
                >Workflows</NuxtLinkLocale
              >
            </div>
          </li>
          <li>|</li>
          <li>
            <div class="flex items-center justify-center space-x-1">
              <span>
                <FileTextIcon class="size-4" />
              </span>
              <NuxtLinkLocale :to="`/project/${projectId}/document`">
                Documents
              </NuxtLinkLocale>
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
