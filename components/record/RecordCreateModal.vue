<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  defineProps<{
    collectionId: string | string[];
  }>();

  const emits = defineEmits<{
    refresh: [void];
  }>();

  const open = ref(false);

  function onSuccess() {
    emits('refresh');
    // open.value = true;
  }
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline">
        Add File
        <PlusIcon class="ml-2 size-4 stroke-2" />
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Add File to Collection</DialogTitle>
        <DialogDescription> Choose a file to add to collection. </DialogDescription>
      </DialogHeader>
      <Suspense>
        <RecordAddMediaTable :collection-id="collectionId" @success="() => onSuccess()" />
      </Suspense>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
