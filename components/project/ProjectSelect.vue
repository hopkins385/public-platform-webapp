<script setup lang="ts">
  const props = defineProps<{
    projectId: string | undefined;
  }>();

  const emits = defineEmits<{
    'update:projectId': [string];
  }>();

  const key = ref(getKey());

  // get cached data
  const { data: projects } = useNuxtData('allProjects');

  function getKey() {
    return +new Date();
  }

  function onUpdate(value: string) {
    emits('update:projectId', value);
  }

  watch(
    () => props.projectId,
    (value) => {
      // if modelValue is undefined, then we clear the filter
      if (value === undefined) {
        key.value = getKey();
      }
    },
  );
</script>

<template>
  <Select :value="projectId" @update:model-value="onUpdate" :key="key">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="All Projects" />
    </SelectTrigger>
    <SelectContent>
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
