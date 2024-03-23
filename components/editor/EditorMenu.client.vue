<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3';
  import {
    BoldIcon,
    Heading1Icon,
    Heading2Icon,
    HighlighterIcon,
    ItalicIcon,
    StrikethroughIcon,
    UnderlineIcon,
    Loader2Icon,
    Undo2Icon,
    Redo2Icon,
  } from 'lucide-vue-next';

  const props = defineProps<{
    editor: Editor;
    isLoading: boolean;
  }>();

  const emits = defineEmits(['toggle-instruction-menu']);

  const onH1Click = () => {
    if (!props.editor) return;
    props.editor.chain().setHeading({ level: 1 }).run();
    props.editor.commands.focus();
  };

  const onH2Click = () => {
    if (!props.editor) return;
    props.editor.chain().setHeading({ level: 2 }).run();
    props.editor.commands.focus();
  };

  const onItalicClick = () => {
    if (!props.editor) return;
    props.editor.chain().toggleMark('italic').run();
    props.editor.commands.focus();
  };

  const onBoldClick = () => {
    if (!props.editor) return;
    props.editor.chain().toggleMark('bold').run();
    props.editor.commands.focus();
  };

  const onUnderlineClick = () => {
    if (!props.editor) return;
    props.editor.chain().toggleMark('underline').run();
    props.editor.commands.focus();
  };

  const onStrikeClick = () => {
    if (!props.editor) return;
    props.editor.chain().toggleMark('strike').run();
    props.editor.commands.focus();
  };

  const onHighlightClick = () => {
    if (!props.editor) return;
    props.editor.chain().toggleMark('highlight').run();
    props.editor.commands.focus();
  };

  const onInstructionClick = () => {
    if (!props.editor) return;
    emits('toggle-instruction-menu');
  };

  const onUndoClick = () => {
    if (!props.editor) return;
    props.editor.chain().undo().run();
    props.editor.commands.focus();
  };

  const onRedoClick = () => {
    if (!props.editor) return;
    props.editor.chain().redo().run();
    props.editor.commands.focus();
  };

  const onImproveClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('improve').run();
  };

  const onExtendClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('extend').run();
  };

  const onShortenClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('shorten').run();
  };

  const onRephraseClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('rephrase').run();
  };

  const onSummarizeClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('summarize').run();
  };

  const onSimplifyClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('simplify').run();
  };

  const onSpellingGrammarClick = () => {
    if (!props.editor) return;
    props.editor.chain().focus().aiAction('spelling').run();
  };

  const onTranslateClick = (lang: string) => {
    console.log(`Translate clicked: ${lang}`);
  };
</script>

<template>
  <div
    v-if="editor"
    class="flex justify-between bg-slate-900 px-4 py-3 text-white"
  >
    <div class="flex space-x-2">
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('heading', { level: 1 }),
        }"
        @click="onH1Click()"
      >
        <Heading1Icon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('heading', { level: 2 }),
        }"
        @click="onH2Click()"
      >
        <Heading2Icon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('bold'),
        }"
        @click="onBoldClick()"
      >
        <BoldIcon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('italic'),
        }"
        @click="onItalicClick()"
      >
        <ItalicIcon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('underline'),
        }"
        @click="onUnderlineClick()"
      >
        <UnderlineIcon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('strike'),
        }"
        @click="onStrikeClick()"
      >
        <StrikethroughIcon class="size-4" />
      </div>
      <div
        class="editor__menu-button"
        :class="{
          'is-active': editor.isActive('highlight'),
        }"
        @click="onHighlightClick()"
      >
        <HighlighterIcon class="size-4" />
      </div>
      <div class="editor__menu-button" @click="onUndoClick()">
        <Undo2Icon class="size-4" />
      </div>
      <div class="editor__menu-button" @click="onRedoClick()">
        <Redo2Icon class="size-4" />
      </div>
      <EditorAIMenu
        @improve-click="() => onImproveClick()"
        @extend-click="() => onExtendClick()"
        @shorten-click="() => onShortenClick()"
        @rephrase-click="() => onRephraseClick()"
        @summarize-click="() => onSummarizeClick()"
        @simplify-click="() => onSimplifyClick()"
        @spelling-grammar-click="() => onSpellingGrammarClick()"
        @translate-click="(lang) => onTranslateClick(lang)"
      />
    </div>
    <div v-if="isLoading" class="flex items-center justify-center">
      <Loader2Icon class="size-6 animate-spin text-slate-100" />
    </div>
  </div>
</template>
