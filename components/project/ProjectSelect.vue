<script setup lang="ts">
  const props = defineProps<{
    projectId: string | undefined;
    projects: {
      id: string;
      name: string;
    }[];
  }>();

  const emits = defineEmits<{
    'update:projectId': [string];
  }>();

  const onUpdate = (value: string) => {
    emits('update:projectId', value);
  };

  const key = ref(getKey());
  function getKey() {
    return +new Date();
  }

  watch(
    () => props.projectId,
    (value) => {
      // if modelValue is undefined, then we should clear the filter
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
