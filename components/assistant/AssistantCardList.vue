<script setup lang="ts">
  const { getAllAssistants } = useManageAssistants();
  const { data: result } = await getAllAssistants();
</script>

<template>
  <div class="grid grid-cols-3 gap-5">
    <AssistantCard
      v-for="assistant in result?.assistants"
      :key="assistant.id"
      :assistant="assistant"
    />
    <div class="hidden p-5 text-sm text-slate-300">{{ result?.meta }}</div>
  </div>
</template>
