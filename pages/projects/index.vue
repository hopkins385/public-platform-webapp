<script setup lang="ts">
  /**
   * Project Index - Grid view of all projects of the Organization
   * Route: /projects
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
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="ml-auto flex flex-col space-y-1 self-end px-3 pb-2 pt-14">
          <LinkButton to="/projects/create">
            New Project
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </LinkButton>
          <LinkButton to="/projects/list">
            Manage Projects
            <SettingsIcon class="ml-2 size-4 stroke-1.5" />
          </LinkButton>
        </div>
      </template>
    </Heading>
    <BoxContainer class="w-full">
      <div>
        <Suspense>
          <ProjectCardGrid />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
