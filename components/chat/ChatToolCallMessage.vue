<script setup lang="ts">
  defineProps<{
    displayName: string;
    activeTools: string[];
  }>();
</script>

<template>
  <ChatMessageBoxWrapper :display-name="displayName">
    <div class="flex flex-col items-center space-y-4 pt-2">
      <div v-for="(tool, index) in activeTools" :key="index" class="flex items-center space-x-2">
        <!-- icon -->
        Executing Tool:&nbsp;<span class="text-sm font-semibold capitalize">{{ tool }}</span>
      </div>
    </div>
  </ChatMessageBoxWrapper>
</template>
