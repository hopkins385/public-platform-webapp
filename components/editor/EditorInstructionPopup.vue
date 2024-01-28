<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core';
  import { XIcon, SendIcon } from 'lucide-vue-next';

  const emits = defineEmits(['close']);
  const popupRef = ref<HTMLElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);

  const onCloseClick = () => {
    emits('close');
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCloseClick();
    }
  };

  onClickOutside(popupRef, onCloseClick);

  onMounted(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
</script>

<template>
  <div
    class="absolute left-0 top-20 z-10 w-full grow px-10"
    :style="{
      height: 'calc(100vh - 14rem)',
    }"
  >
    <div
      ref="popupRef"
      class="relative flex h-full flex-col rounded-lg border bg-white p-5 shadow-md"
      @keydown="onKeyDown"
    >
      <div class="absolute right-0 top-0 text-slate-300 hover:text-slate-500">
        <button class="p-3" @click="onCloseClick">
          <XIcon class="size-4" />
        </button>
      </div>
      <label for="instruction" class="text-sm">Instruction</label>
      <div class="relative my-3">
        <input
          ref="inputRef"
          type="text"
          name="instruction"
          placeholder="Write about..."
          class="w-full rounded-md border p-2 pr-9 placeholder:text-sm"
        />
        <div class="absolute right-0 top-0 text-slate-300 hover:text-slate-500">
          <button class="p-3">
            <SendIcon class="size-4" />
          </button>
        </div>
      </div>
      <p class="py-2 text-sm">Preview</p>
      <div class="grow overflow-y-scroll rounded-md border p-4"></div>
    </div>
  </div>
</template>
