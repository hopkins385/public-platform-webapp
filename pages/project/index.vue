<script setup lang="ts">
  /**
   * Project Index - Grid view of all projects of the Organization
   * Route: /project
   */
  import { PlusIcon, SettingsIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'project.meta.index.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Projects',
      label: 'project.meta.index.title',
    },
  });
</script>

<template>
  <SectionContainer>
    <BoxContainer class="w-full">
      <div class="flex justify-between">
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="() => navigateTo('/project/create')"
          >
            <PlusIcon class="size-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="() => navigateTo('/project/list')"
          >
            <SettingsIcon class="size-4 stroke-1.5" />
          </Button>
        </div>
      </div>
      <div class="mt-5">
        <Suspense>
          <ProjectCardGrid />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
