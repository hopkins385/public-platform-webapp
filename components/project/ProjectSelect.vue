<script setup lang="ts">
  const props = defineProps<{
    projectId: string | undefined;
  }>();

  const emits = defineEmits<{
    'update:projectId': [string];
  }>();

  // make projectId reactive
  const sprojectId = ref(props.projectId);

  const { getAllProjects } = useManageProjects();
  const { data: projects } = await getAllProjects({ lazy: true });

  function update(value: string) {
    emits('update:projectId', value);
  }

  watch(
    () => sprojectId.value,
    (id) => {
      update(id || '');
    },
  );
</script>

<template>
  <Select v-model="sprojectId">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="All Projects" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
