<script setup lang="ts">
  import type { Chat } from '@prisma/client';

  const props = defineProps<{
    id: Chat['id'];
    title: Chat['title'];
    createdAt: Chat['createdAt'];
    assistant: {
      id: Chat['assistantId'];
      title: string;
    };
    active: boolean;
  }>();

  const { getDateTimeForHumans } = useForHumans();
</script>

<template>
  <div
    class="flex h-16 cursor-pointer border-0 text-xs text-muted-foreground"
    @click="navigateTo(`/chat/${id}`)"
  >
    <div class="size-12 shrink-0 rounded-full bg-slate-100"></div>
    <div
      class="flex w-full justify-between pl-3 pt-1"
      :class="{ 'font-semibold': active }"
    >
      <div class="flex flex-col whitespace-nowrap pt-0">
        <span class="">{{ title }}</span>
        <span class="pt-1">{{ assistant?.title }}</span>
      </div>
      <div>
        <span class="pt-0">{{
          getDateTimeForHumans(createdAt, { year: undefined })
        }}</span>
      </div>
    </div>
  </div>
</template>
