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
    SparklesIcon,
    ListChecksIcon,
    CheckCheckIcon,
    MoreHorizontal,
    RepeatIcon,
    BabyIcon,
    TextCursorInputIcon,
    GlobeIcon,
    ChevronRightIcon,
    ListFilterIcon,
    FoldVerticalIcon,
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
</script>

<template>
  <div
    v-if="editor"
    class="flex justify-between bg-slate-900 px-4 py-3 text-white"
  >
    <div class="flex space-x-2">
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2"
        @click="onH1Click()"
      >
        <Heading1Icon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2"
        @click="onH2Click()"
      >
        <Heading2Icon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2 py-1"
        @click="onBoldClick()"
      >
        <BoldIcon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2 py-1"
        @click="onItalicClick()"
      >
        <ItalicIcon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2 py-1"
        @click="onUnderlineClick()"
      >
        <UnderlineIcon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2 py-1"
        @click="onStrikeClick()"
      >
        <StrikethroughIcon class="size-4" />
      </div>
      <div
        class="flex items-center justify-center rounded-md bg-slate-600 px-2 py-1"
        @click="onHighlightClick()"
      >
        <HighlighterIcon class="size-4" />
      </div>
      <HeadlessMenu as="div">
        <HeadlessMenuButton
          class="flex items-center justify-center space-x-1 rounded-md border-0 bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1"
        >
          <span>AI</span>
          <span class="pb-1"><SparklesIcon class="size-3" /></span>
        </HeadlessMenuButton>
        <HeadlessMenuItems
          class="absolute z-10 flex flex-col items-start space-y-1 rounded-lg border bg-white p-4 text-left text-sm text-slate-600 shadow-md"
        >
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active" @click="onInstructionClick">
              <InstructionIcon class="size-4" />
              <span>Instruction</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <CheckCheckIcon class="size-4" />
              <span>Improve</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <MoreHorizontal class="size-4" />
              <span>Extend</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <FoldVerticalIcon class="size-4" />
              <span>Shorten</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <RepeatIcon class="size-4" />
              <span>Rephrase</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <ListFilterIcon class="size-4" />
              <span>Summarize</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <BabyIcon class="size-4" />
              <span>Simplify</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <TextCursorInputIcon class="size-4" />
              <span>Spelling & Grammar</span>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <div class="w-full py-1">
            <hr class="w-full" />
          </div>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <GlobeIcon class="size-4 shrink-0" />
              <div class="flex w-full items-center justify-between">
                <span>Translate</span>
                <span>
                  <ChevronRightIcon class="size-4" />
                </span>
              </div>
            </EditorButtonBox>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <EditorButtonBox :active="active">
              <TextMagnifyIcon class="size-4 shrink-0" />
              <div class="flex w-full items-center justify-between">
                <span>Review</span>
                <span>
                  <ChevronRightIcon class="size-4" />
                </span>
              </div>
            </EditorButtonBox>
          </HeadlessMenuItem>
        </HeadlessMenuItems>
      </HeadlessMenu>
    </div>
    <div v-if="isLoading" class="flex items-center justify-center">
      <Loader2Icon class="size-6 animate-spin text-slate-100" />
    </div>
  </div>
</template>
