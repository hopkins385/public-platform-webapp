<script setup lang="ts">
  import type { ToolInfoData } from '~/interfaces/tool.interfaces';

  defineProps<{
    displayName: string;
    activeTools: ToolInfoData;
  }>();
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-3 text-sm">
    <div class="flex items-center justify-start space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <!-- tool -->
      <div class="space-y-4">
        <div v-for="(tool, index) in activeTools" :key="index" class="flex items-center space-x-2">
          <!-- icon -->
          <p>
            Executing Tool:&nbsp;<span class="text-sm font-semibold capitalize">{{ tool.toolName }}</span>
          </p>
          <p>{{ tool.toolInfo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
