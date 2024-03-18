<script setup lang="ts">
  const { getAllAssistants } = useManageAssistants();
  const { data } = await getAllAssistants();

  const assistants = computed(() => data.value?.assistants || []);
  const meta = computed(() => data.value?.meta || '');
</script>

<template>
  <div v-if="assistants.length > 0" class="grid grid-cols-3 gap-5">
    <AssistantCard
      v-for="assistant in assistants"
      :key="assistant.id"
      :assistant="assistant"
    />
    <div class="hidden p-5 text-sm text-slate-300">{{ meta }}</div>
  </div>
  <div v-else>
    <AssistantEmptyList />
  </div>
</template>
