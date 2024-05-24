<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';

  defineProps<{
    hide?: boolean;
  }>();

  const settings = useChatSettingsStore();
</script>

<template>
  <Dialog v-model:open="settings.newChatModalOpen">
    <!-- DialogTrigger as-child>
      <Button
        variant="outline"
        class="text-xs transition-opacity duration-300 ease-in-out"
        :class="{
          'opacity-0': hide,
          'opacity-90': !hide,
        }"
        size="sm"
      >
        <span>New Chat</span>
        <EditIcon class="ml-2 size-4 stroke-1.5" />
      </Button>
    </!-->
    <DialogContent class="max-h-screen max-w-6xl overflow-y-scroll">
      <DialogHeader>
        <DialogTitle>New Chat</DialogTitle>
        <DialogDescription> Choose an assistant to start a new chat. </DialogDescription>
      </DialogHeader>
      <Suspense>
        <AssistantAllTable @new-chat="settings.newChatModalOpen = false" />
      </Suspense>
      <DialogFooter>
        <Button variant="outline" @click="settings.newChatModalOpen = false"> Cancel </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
