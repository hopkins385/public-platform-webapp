<script setup lang="ts">
  const { getAllProjects } = useManageProjects();
  const { data } = await getAllProjects();

  const projects = computed(() => data.value?.projects || []);
  const meta = computed(() => data.value?.meta || '');
</script>

<template>
  <div v-if="projects.length > 0" class="grid grid-cols-3 gap-5">
    <ProjectCard
      v-for="project in projects"
      :key="project.id"
      :project="project"
    />
    <div class="hidden p-5 text-sm text-slate-300">{{ meta }}</div>
  </div>
  <div v-else class="py-4 text-sm">
    You do not have a project yet.<br />
    Create a new one by clicking on the + button.
  </div>
</template>
