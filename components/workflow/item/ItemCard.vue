<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core';
  import { XIcon } from 'lucide-vue-next';

  const props = defineProps<{
    itemId: string | null | undefined;
    content: string | null | undefined;
  }>();

  const emits = defineEmits<{
    close: [void];
    refresh: [void];
  }>();

  const ac = new AbortController();

  const text = ref(props.content || '');
  const pending = ref(false);

  const { updateDocumentItem } = useManageDocumentItems();

  async function updateItem(value: string) {
    console.log(value, props.itemId);
    await updateDocumentItem({
      documentItemId: props.itemId,
      content: value,
    });
    emits('refresh');
  }

  async function updateAndClose(event: KeyboardEvent) {
    // event.preventDefault();
    // if key shift + enter
    if (event.shiftKey && event.key === 'Enter') {
      return;
    }

    await updateItem(text.value);
    emits('close');
  }

  function setPending(value: boolean) {
    if (value === pending.value) return;
    pending.value = value;
  }

  const onUpdate = useDebounceFn(async (value) => {
    // await updateItem(value);
    setPending(false);
  }, 1500);

  watch(
    () => text.value,
    () => {
      setPending(true);
      onUpdate(text.value);
    },
  );

  onMounted(() => {
    // set focus
    const textarea = document.getElementById('item-card-textarea');
    if (textarea) {
      textarea.focus();
    }
  });

  /*
      :model-value="content"
      @update:model-value="(payload) => onUpdate(payload)"
    */
  // onBeforeUnmount(() => {
  //   updateDocumentItem(text.value);
  // });
</script>

<template>
  <div
    class="relative w-96 overflow-hidden rounded-2xl border bg-white shadow-md"
  >
    <button
      class="absolute right-0 top-0 p-2 text-muted-foreground opacity-60 hover:opacity-100"
      @click.stop="$emit('close')"
    >
      <XIcon class="size-3 cursor-pointer" />
    </button>
    <div class="rounded-2xl border p-5">
      <Textarea
        id="item-card-textarea"
        v-model="text"
        class="text-xs"
        style="resize: none; height: 21rem; width: 100%; border: 0; outline: 0"
        @keydown.enter="updateAndClose"
      />
    </div>
  </div>
</template>
