<script setup lang="ts">
  import {
    Editor,
    EditorContent,
    BubbleMenu as BubbleBox,
  } from '@tiptap/vue-3';
  import { StarterKit } from '@tiptap/starter-kit';
  import { Highlight } from '@tiptap/extension-highlight';
  import { Underline } from '@tiptap/extension-underline';
  import useCompletion from './composables/useCompletion';

  const props = defineProps<{
    modelValue: string;
  }>();

  const emits = defineEmits(['update:modelValue']);

  const editorWrapperRef = ref<Element | null>(null);
  const showInstructionMenu = ref(false);
  const toggleInstructionMenu = () => {
    showInstructionMenu.value = !showInstructionMenu.value;
  };

  const { onOneClick, isLoading } = useCompletion();

  const showLoading = computed(() => {
    return isLoading.value;
  });

  const editor = new Editor({
    content: props.modelValue,
    extensions: [StarterKit, Highlight, Underline],
    onUpdate: ({ editor }) => {
      emits('update:modelValue', editor.getHTML());
    },
  });

  const setFocus = () => {
    const editorWrapper = window.document.getElementById(
      'editor-content-wrapper',
    );
    if (editorWrapper) {
      const child = editorWrapper.children[0] as HTMLElement;
      if (child) {
        child.focus();
      }
    }
  };

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
      <button @click="onOneClick(editor)">One</button>
      <div v-if="isLoading">loading</div>
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

<style>
  #text-editor {
    .ProseMirror {
      height: calc(100dvh - 10rem);
      width: 100%;
      overflow-y: auto;
      padding: 0.5em 1em;
      outline: none;
      font-size: 1.025rem;
      font-weight: 400;
      color: rgb(15 23 42 / var(--tw-text-opacity));

      > p:first-child {
        margin-top: 0.5em;
      }

      > h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        &:first-child {
          margin-top: 0.5em;
        }
      }

      > p:last-child {
        margin-bottom: 0.5em;
      }

      h1 {
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: bold;
      }

      h2 {
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: bolder;
      }
    }
  }
</style>
