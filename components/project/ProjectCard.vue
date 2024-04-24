<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';

  defineProps<{
    project: any;
  }>();
</script>

<template>
  <div
    class="group relative max-w-sm cursor-pointer rounded-lg border p-10 hover:border-slate-400"
  >
    <div class="group/icon absolute right-1 top-1 hidden group-hover:block">
      <Button
        size="icon"
        variant="ghost"
        @click.stop="() => navigateTo(`/project/${project.id}`)"
      >
        <EditIcon
          class="size-4 stroke-1.5 opacity-50 group-hover/icon:stroke-2"
        />
      </Button>
    </div>
    <div class="text-base font-semibold">{{ project.name }}</div>
    <div class="mt-4 truncate text-sm">{{ project.description }}</div>
  </div>
</template>
