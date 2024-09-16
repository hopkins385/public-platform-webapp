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
  import useEditorActions from './composables/useEditorActions';

  const props = defineProps<{
    editor: Editor;
    isLoading: boolean;
    autocompleteIsActive: boolean;
  }>();

  const emit = defineEmits<{
    toggleInstructionMenu: [void];
    'update:autocompleteIsActive': [boolean];
  }>();

  const {
    onImproveClick,
    onExtendClick,
    onShortenClick,
    onSummarizeClick,
    onSimplifyClick,
    onSpellingGrammarClick,
    onRephraseClick,
    onH1Click,
    onH2Click,
    onBoldClick,
    onItalicClick,
    onUnderlineClick,
    onStrikeClick,
    onHighlightClick,
    onUndoClick,
    onRedoClick,
  } = useEditorActions(props.editor);

  const hasTextSelected = computed(() => {
    const { from, to } = props.editor.state.selection;
    return from !== to;
  });

  function onInstructionClick() {
    emit('toggleInstructionMenu');
  }

  function onTranslateClick(lang: string) {
    console.log(`Translate clicked: ${lang}`);
  }

  function onAutocompleteIsActiveChange(isActive: boolean) {
    console.log(`Autocomplete is active: ${isActive}`);
    emit('update:autocompleteIsActive', isActive);
  }
</script>

<template>
  <div v-if="editor" class="relative flex justify-between bg-slate-900 px-4 py-3 text-white">
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
      <!--
      <EditorAIMenu
        :disabled="!hasTextSelected"
        :is-loading="isLoading"
        @improve-click="() => onImproveClick()"
        @extend-click="() => onExtendClick()"
        @shorten-click="() => onShortenClick()"
        @rephrase-click="() => onRephraseClick()"
        @summarize-click="() => onSummarizeClick()"
        @simplify-click="() => onSimplifyClick()"
        @spelling-grammar-click="() => onSpellingGrammarClick()"
        @translate-click="(lang) => onTranslateClick(lang)"
      />
      -->
      <div v-if="isLoading" class="flex items-center justify-center">
        <Loader2Icon class="size-6 animate-spin text-slate-300" />
      </div>
    </div>
    <!--
    <div class="ml-auto flex items-center space-x-4">
      <div class="text-sm">Autocomplete</div>
      <Switch
        :checked="autocompleteIsActive"
        class="outline outline-slate-500"
        @update:checked="onAutocompleteIsActiveChange"
      />
    </div>
    -->
  </div>
</template>
