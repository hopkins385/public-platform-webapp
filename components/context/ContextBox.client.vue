<script setup lang="ts">
  import { useClipboard, useEventListener, useMouse } from '@vueuse/core';
  import { CheckIcon, CopyIcon, PlusIcon } from 'lucide-vue-next';

  const contextMenuRef = ref<HTMLElement | null>(null);
  const position = ref({ x: 0, y: 0 });
  const selectedText = ref('');

  const showContextMenu = computed(() => selectedText.value.length > 0);

  const { x: mouseX, y: mouseY } = useMouse();
  const { copy, copied, isSupported } = useClipboard({ source: selectedText });

  function onMouseUp() {
    setTimeout(() => {
      const selection = document.getSelection();
      const docSelectedText = selection?.toString();
      selectedText.value = docSelectedText || '';

      // get the width and height of the context menu
      const contextMenu = contextMenuRef.value;
      // get the #chatWrapper width and height
      const container = document.querySelector('#chatWrapper') as HTMLDivElement;

      // limit the context menu to the container
      if (contextMenu && container) {
        const contextMenuWidth = contextMenu.offsetWidth;
        const containerWidth = container.offsetWidth;
        const x = mouseX.value + contextMenuWidth > containerWidth ? mouseX.value - contextMenuWidth : mouseX.value;
        // const y = mouseY.value + contextMenuHeight > containerHeight ? mouseY.value - contextMenuHeight : mouseY.value;

        position.value = { x, y: mouseY.value + 20 };
      }
    }, 0);
  }

  useEventListener(document, 'mouseup', onMouseUp);

  // Add event listener to context menu to stop propagation of mouseup event
  useEventListener(contextMenuRef, 'mouseup', (evt: MouseEvent) => {
    evt.stopPropagation();
  });

  function onCopyClick() {
    if (!isSupported.value) {
      console.error('Copy is not supported');
      return;
    }
    copy();
  }
</script>

<template>
  <div
    v-show="showContextMenu"
    ref="contextMenuRef"
    class="fixed z-50 space-x-2 rounded-lg border bg-white p-1 text-sm shadow-lg"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <button>
      <div class="flex items-center rounded-lg border-0 px-3 py-1 hover:bg-neutral-100">
        <div><PlusIcon class="size-4 stroke-1.5" /></div>
        <div class="block-inline ml-2">Add</div>
      </div>
    </button>
    <button :disabled="!isSupported" @click="onCopyClick">
      <div class="flex items-center rounded-lg border-0 px-3 py-1 hover:bg-neutral-100">
        <div>
          <CheckIcon v-if="copied" class="size-4 stroke-1.5" />
          <CopyIcon v-else class="size-4 stroke-1.5" />
        </div>
        <div class="block-inline ml-2" :class="{ 'opacity-50': !isSupported }">Copy</div>
      </div>
    </button>
  </div>
</template>
