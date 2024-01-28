<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';

  defineProps<{
    assistant: any;
  }>();
</script>

<template>
  <div
    class="group relative max-w-sm cursor-pointer rounded-lg border p-10 hover:border-slate-400"
    @click="navigateTo(`/chat?assistantId=${assistant.id}`)"
  >
    <div class="group/icon absolute right-1 top-1 hidden group-hover:block">
      <Button
        size="icon"
        variant="ghost"
        @click.stop="navigateTo(`/admin/assistant/${assistant.id}`)"
      >
        <EditIcon
          class="size-4 stroke-1.5 opacity-50 group-hover/icon:stroke-2"
        />
      </Button>
    </div>
    <div class="text-base font-semibold">{{ assistant.title }}</div>
    <div class="mt-4 text-sm">{{ assistant.description }}</div>
  </div>
</template>
