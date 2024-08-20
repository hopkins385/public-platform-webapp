<script setup lang="ts">
  import {
    Editor,
    EditorContent,
    // BubbleMenu as BubbleBox,
  } from '@tiptap/vue-3';
  import { StarterKit } from '@tiptap/starter-kit';
  import { Highlight } from '@tiptap/extension-highlight';
  import { Underline } from '@tiptap/extension-underline';
  import { AI } from './extensions/ai-extension';
  import { AIAutocomplete } from './extensions/autocomplete/autocomplete-extension';
  import useRunCompletion from './composables/useRunCompletion';
  import useFetchAutoCompletion from './composables/useFetchAutoCompletion';
  // import BubbleBoxAIMenu from './components/BubbleBoxAIMenu.vue';

  const props = defineProps<{
    modelValue: string;
  }>();

  const emits = defineEmits(['update:modelValue']);
  const { locale } = useI18n();
  const { runCompletion, isLoading } = useRunCompletion();
  const { fetchAutoCompletion, isLoading: autoCompleteIsLoading } = useFetchAutoCompletion();

  const editorWrapperRef = ref<Element | null>(null);
  const showInstructionMenu = ref(false);

  const editor = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Highlight,
      Underline,
      AI.configure({
        lang: locale.value,
        completionHandler: runCompletion,
      }),
      AIAutocomplete.configure({
        lang: locale.value,
        autoCompletionHandler: fetchAutoCompletion,
      }),
    ],
    onUpdate: ({ editor }) => {
      emits('update:modelValue', editor.getHTML());
    },
  });

  const showLoading = computed(() => {
    return isLoading.value;
  });

  // if is loading set editable to false
  watch(showLoading, (value) => {
    editor.setOptions({ editable: !value });
  });

  function setFocus() {
    const editorWrapper = window.document.getElementById('editor-content-wrapper');
    if (editorWrapper) {
      const child = editorWrapper.children[0] as HTMLElement;
      if (child) {
        child.focus();
      }
    }
  }

  function toggleInstructionMenu() {
    showInstructionMenu.value = !showInstructionMenu.value;
  }

  onMounted(() => {
    nextTick(() => {
      setFocus();
    });
  });

  onBeforeUnmount(() => {
    if (editor) editor.destroy();
  });

  // tbd
  const autocompleteIsActive = ref(false);
</script>

<template>
  <div id="text-editor" class="relative overflow-hidden rounded-lg border-0 border-slate-300 bg-white shadow-sm">
    <!-- Menu -->
    <EditorMenu
      v-model:autocomplete-is-active="autocompleteIsActive"
      :editor="editor"
      :is-loading="showLoading"
      @toggle-instruction-menu="toggleInstructionMenu"
    />
    <!-- Menu END-->
    <!-- Instruction Menu -->
    <!--
    <EditorInstructionPopup
      v-if="showInstructionMenu"
      @close="toggleInstructionMenu"
    />
    -->
    <!-- Instruction Menu END -->
    <!-- Bubble Box -->
    <!--
    <BubbleBox
      class="w-96"
      :editor="editor"
      :tippy-options="{ duration: 100, placement: 'bottom' }"
    >
      <BubbleBoxAIMenu :editor="editor" :is-loading="showLoading" />
    </BubbleBox>
    -->
    <!-- Bubble Box END -->
    <!-- Editor -->
    <EditorContent
      id="editor-content-wrapper"
      ref="editorWrapperRef"
      :editor="editor"
      :class="showLoading ? 'pointer-events-none opacity-50' : 'pointer-events-auto'"
    />
    <!-- Editor END -->
  </div>
</template>
