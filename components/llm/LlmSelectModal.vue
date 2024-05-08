<script setup lang="ts">
  import { SettingsIcon } from 'lucide-vue-next';

  const props = defineProps<{
    initialDisplayName: string;
    id: string;
  }>();

  const emits = defineEmits<{
    'update:id': [string];
  }>();

  const open = ref(false);

  const { getAllModels } = useLLMs();
  const {
    data: models,
    pending,
    refresh,
  } = await getAllModels({ immediate: false });

  const selectedModel = computed(() => {
    return (
      models.value?.find((model: any) => model.id === props.id) || {
        displayName: props.initialDisplayName,
      }
    );
  });

  function onModelClick(id: string) {
    emits('update:id', id);
    open.value = false;
  }

  watch(open, () => {
    if (open.value === true && !models.value) {
      refresh();
    }
  });
</script>

<template>
  <div class="flex items-center space-x-3">
    <div
      class="cursor-pointer rounded-lg border px-5 py-2.5 text-sm"
      @click="() => (open = true)"
    >
      {{ selectedModel.displayName }}
    </div>
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="outline" size="icon">
          <SettingsIcon
            class="size-4 text-slate-500 group-hover:text-slate-900"
          />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change AI Model</DialogTitle>
          <DialogDescription>
            Choose a different AI model for this assistant.
          </DialogDescription>
        </DialogHeader>
        <div v-if="pending">Loading...</div>
        <div v-else class="space-y-2">
          <div
            v-for="model in models"
            :key="model.id"
            @click="() => onModelClick(model.id)"
          >
            <Button
              :variant="model.id !== props.id ? 'outline' : 'default'"
              size="sm"
            >
              {{ model.displayName }}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
