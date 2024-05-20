<script setup lang="ts">
  const input = ref<string>('');
</script>

<template>
  <SectionContainer>
    <div class="flex flex-col items-center justify-center space-y-8 rounded-lg">
      <div class="w-full">
        <EditorBox v-model="input" />
      </div>
    </div>
  </SectionContainer>
</template>
