<script setup lang="ts">
  import { onClickOutside, useDebounceFn, useEventListener } from '@vueuse/core';
  import { XIcon } from 'lucide-vue-next';

  const props = defineProps<{
    itemId: string | null | undefined;
    content: string | null | undefined;
    width?: number;
    height?: number;
  }>();

  const emits = defineEmits<{
    close: [void];
    refresh: [void];
  }>();

  const text = ref(props.content || '');
  const pending = ref(false);
  const cellCardRef = ref<HTMLDivElement | null>(null);

  const { updateDocumentItem } = useManageDocumentItems();

  async function updateItem(value: string) {
    await updateDocumentItem({
      documentItemId: props?.itemId || '',
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
  }, 250);

  watch(
    () => text.value,
    () => {
      setPending(true);
      onUpdate(text.value);
    },
  );

  onClickOutside(cellCardRef, async () => {
    emits('close');
  });

  // useEventListener('keydown', (event) => {
  //   if (event.key === 'Escape') {
  //     emits('close');
  //   }
  // });

  onMounted(() => {
    // set focus
    const textarea = document.getElementById('item-card-textarea');
    if (textarea) {
      textarea.focus({
        preventScroll: true,
      });
    }
  });

  const widthCalc = computed(() => {
    return props.width ? `${props.width}px` : undefined;
  });

  const heightCalc = computed(() => {
    return props.height ? `${props.height}px` : undefined;
  });
</script>

<template>
  <div
    ref="cellCardRef"
    class="relative flex overflow-hidden rounded-2xl border bg-white shadow-md"
    :class="{ 'min-w-96': !width }"
    :style="{ width: widthCalc, 'min-height': heightCalc }"
  >
    <button
      class="absolute right-0 top-0 p-2 text-muted-foreground opacity-60 hover:opacity-100"
      @click.stop="$emit('close')"
    >
      <XIcon class="size-3 cursor-pointer" />
    </button>
    <div class="grow rounded-2xl border-0 border-red-200 p-3">
      <Textarea
        id="item-card-textarea"
        v-model="text"
        class="text-xs"
        style="resize: both; height: 100%"
        @keydown.enter="updateAndClose"
      />
    </div>
  </div>
</template>
