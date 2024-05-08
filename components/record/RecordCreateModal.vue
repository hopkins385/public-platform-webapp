<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  defineProps<{
    collectionId: string | string[];
  }>();

  const open = ref(false);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline">
        Add Record
        <PlusIcon class="ml-2 size-4 stroke-2" />
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Add Record</DialogTitle>
        <DialogDescription>
          Choose a file to create a record from.
        </DialogDescription>
      </DialogHeader>
      <Suspense>
        <RecordAddMediaTable :collection-id="collectionId" />
      </Suspense>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
