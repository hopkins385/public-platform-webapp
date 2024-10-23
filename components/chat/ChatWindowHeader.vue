<script setup lang="ts">
  import { z } from 'zod';

  const props = defineProps<{
    chatId: string;
    isHidden?: boolean;
    assistantTitle?: string;
    chatTitle?: string;
  }>();

  const localTitle = ref<string>(props.chatTitle ?? '');

  const socket = useWebsocketGlobal();

  const updateTitleSchema = z.object({
    chatTitle: z.string().trim().min(1, 'Title cannot be empty').max(100, 'Title is too long'),
  });

  function updateTitle(data: unknown) {
    const result = updateTitleSchema.safeParse(data);
    if (!result.success) {
      console.error('Invalid data received:', result.error);
      return;
    }
    localTitle.value = result.data.chatTitle;
  }

  onMounted(() => {
    socket.on(`chat-${props.chatId}-update-title-event`, updateTitle);
  });

  onBeforeUnmount(() => {
    socket.off(`chat-${props.chatId}-update-title-event`, updateTitle);
  });
</script>

<template>
  <div v-show="isHidden !== true" class="max-w-xs text-center text-sm xl:max-w-lg">
    <p class="opacity-50">{{ assistantTitle ?? '' }}</p>
    <p :key="localTitle" class="whitespace-break-spaces opacity-50">{{ localTitle }}</p>
  </div>
</template>
