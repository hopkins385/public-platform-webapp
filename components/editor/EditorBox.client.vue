<script setup lang="ts">
  import {
    Editor,
    EditorContent,
    BubbleMenu as BubbleBox,
  } from '@tiptap/vue-3';
  import { StarterKit } from '@tiptap/starter-kit';
  import { Highlight } from '@tiptap/extension-highlight';
  import { Underline } from '@tiptap/extension-underline';
  import { AI } from './extensions/ai-extension';

  const props = defineProps<{
    modelValue: string;
  }>();

  const emits = defineEmits(['update:modelValue']);
  const { locale } = useI18n();

  const editorWrapperRef = ref<Element | null>(null);
  const showInstructionMenu = ref(false);

  const editor = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Highlight,
      Underline,
      AI.configure({ lang: locale.value }),
    ],
    onUpdate: ({ editor }) => {
      emits('update:modelValue', editor.getHTML());
    },
  });

  const editorMeta = computed(() => {
    return editor.state.tr.getMeta('ai-status');
  });

  const showLoading = computed(() => {
    return false;
  });

  function setFocus() {
    const editorWrapper = window.document.getElementById(
      'editor-content-wrapper',
    );
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
</script>

<template>
  <div
    id="text-editor"
    class="relative overflow-hidden rounded-lg border-0 border-slate-300 bg-white shadow-sm"
  >
    <!-- Menu -->
    <EditorMenu
      :editor="editor"
      :is-loading="showLoading"
      @toggle-instruction-menu="toggleInstructionMenu"
    />
    <!-- Menu END-->
    <!-- Instruction Menu -->
    <EditorInstructionPopup
      v-if="showInstructionMenu"
      @close="toggleInstructionMenu"
    />
    <!-- Instruction Menu END -->
    <!-- Bubble Box -->
    <BubbleBox
      v-if="editor"
      class="rounded-lg bg-slate-200 px-5 py-2 shadow-lg"
      :editor="editor"
      :tippy-options="{ duration: 100, placement: 'bottom' }"
    >
      <button @click="editor.chain().focus().aiAction('random').run()">
        One
      </button>
      <div v-if="showLoading">loading</div>
    </BubbleBox>
    <!-- Bubble Box END -->
    <!-- Editor -->
    <EditorContent
      id="editor-content-wrapper"
      ref="editorWrapperRef"
      :editor="editor"
    />
    <!-- Editor END -->
  </div>
</template>
