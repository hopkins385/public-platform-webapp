<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';
  const { $client } = useNuxtApp();

  const props = defineProps<{
    assistant: any;
  }>();

  const createChat = async () => {
    if (!props.assistant.id) return;
    return await $client.chat.create.query({
      assistantId: props.assistant.id,
    });
  };

  const onStartClick = async () => {
    const chat = await createChat();
    if (!chat) return;
    navigateTo(`/chat/${chat.id}`);
  };
</script>

<template>
  <div
    class="group relative max-w-sm cursor-pointer rounded-lg border p-10 hover:border-slate-400"
    @click="onStartClick"
  >
    <div class="group/icon absolute right-1 top-1 hidden group-hover:block">
      <Button
        size="icon"
        variant="ghost"
        @click.stop="navigateTo(`/assistant/${assistant.id}/edit`)"
      >
        <EditIcon
          class="size-4 stroke-1.5 opacity-50 group-hover/icon:stroke-2"
        />
      </Button>
    </div>
    <div class="group absolute bottom-1 right-1 hidden group-hover:block">
      <div
        class="flex items-center justify-center space-x-2 rounded-xl border px-4 py-2"
      >
        <span class="text-sm">Start Chat</span>
      </div>
    </div>
    <div class="text-base font-semibold">{{ assistant.title }}</div>
    <div class="mt-4 text-sm">{{ assistant.description }}</div>
  </div>
</template>
