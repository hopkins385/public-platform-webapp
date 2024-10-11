<script setup lang="ts">
  import { useClipboard } from '@vueuse/core';
  import { ClipboardCheckIcon, ClipboardIcon, EyeOffIcon, RepeatIcon, SquarePenIcon } from 'lucide-vue-next';

  defineProps<{
    prompt: string;
    runId: string;
  }>();

  const emit = defineEmits<{
    reRun: [prompt: string];
    usePrompt: [prompt: string];
    hide: [runId: string];
  }>();

  const promptCopy = ref('');
  const {
    copy: copyToClipboard,
    copied: copiedToClipboard,
    isSupported: copyToClipboardSupported,
  } = useClipboard({ source: promptCopy });

  const usePrompt = (prompt: string) => emit('usePrompt', prompt);
  const reRun = (prompt: string) => emit('reRun', prompt);
  const hide = (runId: string) => emit('hide', runId);
</script>

<template>
  <div ref="sidebar" class="group flex w-full grow flex-col border-0 px-5">
    <div class="rounded-lg p-1">
      <p class="line-clamp-4 max-h-40 min-h-5 break-words text-sm opacity-75 hover:opacity-100">
        {{ prompt }}
      </p>
    </div>
    <div class="py-2 opacity-60">
      <span class="rounded-lg bg-stone-100 px-3 py-2 text-xxs">Flux 1.1 Pro</span>
    </div>
    <div class="relative flex items-center space-x-0 py-2 opacity-0 group-hover:opacity-100">
      <!--group-hover:flex -->
      <button
        class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
        @click="reRun(prompt)"
      >
        <div>
          <RepeatIcon class="size-4 stroke-1.5" />
        </div>
        <div>Rerun</div>
      </button>
      <button
        class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
        @click="usePrompt(prompt)"
      >
        <div>
          <SquarePenIcon class="size-4 stroke-1.5" />
        </div>
        <div>Use</div>
      </button>
      <button
        class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
        @click="copyToClipboard(prompt)"
      >
        <div>
          <ClipboardIcon v-if="!copiedToClipboard" class="size-4 stroke-1.5" />
          <ClipboardCheckIcon v-else class="size-4 stroke-1.5" />
        </div>
        <div>Copy</div>
      </button>
      <button
        class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
        @click="hide(runId)"
      >
        <div>
          <EyeOffIcon class="size-4 stroke-1.5" />
        </div>
        <div>Hide</div>
      </button>
    </div>
  </div>
</template>
