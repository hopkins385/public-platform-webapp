<script setup lang="ts">
  import { EditIcon } from 'lucide-vue-next';

  defineProps<{
    hide: boolean;
  }>();

  const open = ref(false);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="text-xs text-muted-foreground transition-opacity duration-300 ease-in-out"
        :class="{
          'opacity-0': hide,
          'opacity-90': !hide,
        }"
        size="sm"
      >
        <span>New Chat</span>
        <EditIcon class="ml-2 size-4 stroke-1.5" />
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-screen max-w-6xl overflow-y-scroll">
      <DialogHeader>
        <DialogTitle>New Chat</DialogTitle>
        <DialogDescription>
          Choose an assistant to start a new chat.
        </DialogDescription>
      </DialogHeader>
      <Suspense>
        <AssistantCardGrid />
      </Suspense>

      <DialogFooter>
        <Button variant="ghost" @click="open = false">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
