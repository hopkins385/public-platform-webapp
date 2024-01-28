<script setup lang="ts">
  definePageMeta({
    title: 'editor.meta.title',
  });
  const input = ref<string>('');
</script>

<template>
  <SectionContainerWithImage>
    <div class="flex flex-col items-center justify-center space-y-8 rounded-lg">
      <div class="w-full">
        <EditorBox v-model="input" />
      </div>
    </div>
  </SectionContainerWithImage>
</template>
