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
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { data: auth } = useAuth();
  const { projectId } = useRoute().params;
  const { getProject } = useManageProjects();
  const { data: projectData } = await getProject(projectId);

  const breadcrumbLinks = computed(() => {
    return [
      { icon: 'users', label: 'Team', to: '/' },
      { icon: 'folders', label: 'Projects', to: '/project' },
      {
        icon: 'folder',
        label: projectData.value?.name ?? 'Project',
        to: `/project/${projectId}`,
      },
      { icon: 'workflow', label: 'Workflows', to: `/project/${projectId}` },
    ];
  });
</script>

<template>
  <SectionContainerWithImage>
    <BreadcrumbBanner :links="breadcrumbLinks" class="-mt-4" />
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
  </SectionContainerWithImage>
</template>
