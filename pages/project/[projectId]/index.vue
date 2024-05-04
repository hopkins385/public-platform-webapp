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
    <BoxContainer class="-mt-0 mb-4 py-5 text-muted-foreground">
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
      <div class="flex justify-between pb-6">
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="() => navigateTo(`/project/${projectId}/workflow/create`)"
          >
            <PlusIcon class="size-4" />
          </Button>
        </div>
        <div>
          <!-- placeholder for later -->
        </div>
      </div>
      <Suspense>
        <WorkflowProjectTable :project-id="projectId" />
        <template #fallback>
          <div>Loading ...</div>
        </template>
      </Suspense>
    </BoxContainer>
  </SectionContainer>
</template>
