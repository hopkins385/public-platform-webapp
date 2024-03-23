<script setup lang="ts">
  import {
    SparklesIcon,
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
</script>

<template>
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
        <EditorButtonBox
          :active="active"
          @click="onInstructionClick"
          class="hidden"
        >
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
      <HeadlessMenuItem v-slot="{ active }" class="hidden">
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
</template>
