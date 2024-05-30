<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';

  defineProps<{
    project: any;
  }>();
</script>

<template>
  <div class="group relative max-w-sm rounded-lg border p-10">
    <div class="group/icon absolute right-1 top-1 hidden group-hover:block">
      <LinkButton size="icon" variant="ghost" :to="`/projects/${project.id}/edit`">
        <EditIcon class="size-4 stroke-1.5 opacity-50 group-hover/icon:stroke-2" />
      </LinkButton>
    </div>
    <div class="text-base font-semibold">{{ project.name }}</div>
    <div class="mt-4 truncate text-sm">{{ project.description }}</div>
  </div>
</template>
