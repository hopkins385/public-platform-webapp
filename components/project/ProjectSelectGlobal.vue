<script setup lang="ts">
  const props = defineProps<{
    selectTriggerClass?: string;
  }>();

  const projectStore = useProjectStore();

  // TODO: optimize this
  const { getAllProjects } = useManageProjects();
  const { data: projects } = await getAllProjects({
    lazy: true,
  });

  onMounted(() => {
    if (!projectStore.activeProjectId) {
      projectStore.activeProjectId = projects.value[0].id;
    }
  });
</script>

<template>
  <Select
    v-model="projectStore.activeProjectId"
    :key="projectStore.activeProjectId"
  >
    <SelectTrigger class="w-full min-w-[180px]" :class="selectTriggerClass">
      <SelectValue placeholder="All Projects" />
    </SelectTrigger>
    <SelectContent class="">
      <SelectGroup>
        <SelectItem
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
