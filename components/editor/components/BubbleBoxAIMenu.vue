<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3';
  import useEditorActions from '../composables/useEditorActions';
  import { SendIcon } from 'lucide-vue-next';

  const props = defineProps<{
    editor: Editor;
    isLoading: boolean;
  }>();

  const {
    onImproveClick,
    onExtendClick,
    onShortenClick,
    onSummarizeClick,
    onSimplifyClick,
    onSpellingGrammarClick,
    onRephraseClick,
    onCustomActionClick,
  } = useEditorActions(props.editor);

  const showLoading = computed(() => {
    return props.isLoading;
  });

  const customInstrucion = ref('');
</script>

<template>
  <div class="rounded-lg border bg-slate-100 px-5 py-2 text-sm shadow-lg">
    <ul class="flex hidden space-x-2">
      <li>
        <button @click="onImproveClick">Improve</button>
      </li>
      <li>|</li>
      <li>
        <button @click="onExtendClick">Extend</button>
      </li>
      <li>|</li>
      <li>
        <button @click="onShortenClick">Shorten</button>
      </li>
      <li>|</li>
      <li>
        <button @click="onSummarizeClick">Summarize</button>
      </li>
      <li>|</li>
      <li>
        <button @click="onSimplifyClick">Simplify</button>
      </li>
      <li>|</li>
      <li>
        <button @click="onSpellingGrammarClick">Spelling & Grammar</button>
      </li>
    </ul>
    <div class="relative mt-2">
      <input
        v-model="customInstrucion"
        type="text"
        placeholder="custom instruction..."
        class="w-full rounded-lg p-2"
      />
      <button
        class="absolute right-0 top-1/2 -translate-y-1/2 border-0 px-3 py-2"
        @click="onCustomActionClick(customInstrucion)"
      >
        <SendIcon class="size-3 text-slate-500" />
      </button>
    </div>
  </div>
</template>
