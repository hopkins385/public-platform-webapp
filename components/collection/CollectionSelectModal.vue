<script setup lang="ts">
  import { SettingsIcon } from 'lucide-vue-next';

  const props = defineProps<{
    initialDisplayName: string;
    id: string;
  }>();

  const emits = defineEmits<{
    'update:id': [string];
    reset: [void];
  }>();

  const collectionId = toRef(props.id);
  const open = ref(false);

  const { findAll } = useManageCollections();
  const { data: collections } = await findAll({ lazy: true });

  const selectdCollection = computed(() =>
    collections.value?.find(
      (collection: any) => collection.id === collectionId.value,
    ),
  );

  function setOpen(value: boolean) {
    open.value = value;
  }

  async function onCollectionClick(id: string) {
    emits('update:id', id);
    open.value = false;
  }

  function onResetClick(id: string) {
    emits('reset');
    open.value = false;
  }
</script>

<template>
  <div class="flex items-center space-x-3">
    <div
      class="cursor-pointer rounded-lg border px-5 py-2.5 text-sm"
      @click="() => (open = true)"
    >
      {{ selectdCollection?.name || initialDisplayName }}
    </div>
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="outline" size="icon">
          <SettingsIcon class="size-4 stroke-1.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Collection</DialogTitle>
          <DialogDescription>
            This is a list of all available collections.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          v-for="collection in collections"
          :key="collection.id"
          @click="() => onCollectionClick(collection.id)"
        >
          {{ collection.name }}
        </Button>

        <Button variant="outline" @click="onResetClick"> Reset </Button>

        <DialogFooter>
          <Button variant="ghost" @click="() => setOpen(false)">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
