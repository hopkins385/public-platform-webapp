<script setup lang="ts">
  import {
    SparklesIcon,
    CheckCheckIcon,
    MoreHorizontal,
    RepeatIcon,
    BabyIcon,
    TextCursorInputIcon,
    GlobeIcon,
    ListFilterIcon,
    FoldVerticalIcon,
    ChevronRightIcon,
  } from 'lucide-vue-next';

  defineProps<{
    disabled: boolean;
    isLoading: boolean;
  }>();

  defineEmits<{
    improveClick: [void];
    extendClick: [void];
    shortenClick: [void];
    rephraseClick: [void];
    summarizeClick: [void];
    simplifyClick: [void];
    spellingGrammarClick: [void];
    translateClick: [string];
  }>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <button
        class="flex items-center justify-center space-x-1 rounded-md border-0 bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1"
      >
        <span>AI</span>
        <span class="pb-1"><SparklesIcon class="size-3" /></span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="relative w-52 p-2">
      <div
        v-if="disabled || isLoading"
        class="absolute inset-0 z-10 flex h-full w-full justify-center rounded-lg bg-white/80 backdrop-blur-sm"
      >
        <p class="px-4 pt-10 text-center text-sm font-semibold text-slate-900">
          {{
            disabled
              ? 'Please first select some text to activate AI features.'
              : 'Loading ...'
          }}
        </p>
      </div>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('improveClick')">
          <CheckCheckIcon class="size-4" />
          <span>Improve</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('extendClick')">
          <MoreHorizontal class="size-4" />
          <span>Extend</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('shortenClick')">
          <FoldVerticalIcon class="size-4" />
          <span>Shorten</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('rephraseClick')">
          <RepeatIcon class="size-4" />
          <span>Rephrase</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('summarizeClick')">
          <ListFilterIcon class="size-4" />
          <span>Summarize</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox :active="false" @click="() => $emit('simplifyClick')">
          <BabyIcon class="size-4" />
          <span>Simplify</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuItem class="p-2">
        <EditorButtonBox
          :active="false"
          @click="() => $emit('spellingGrammarClick')"
        >
          <TextCursorInputIcon class="size-4" />
          <span>Spelling & Grammar</span>
        </EditorButtonBox>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger class="p-2">
          <EditorButtonBox :active="false">
            <GlobeIcon class="size-4 shrink-0" />
            <div class="flex w-full items-center justify-between">
              <span>Translate</span>
              <ChevronRightIcon class="size-4" />
            </div>
          </EditorButtonBox>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'en')"
              >
                <span>English</span>
              </EditorButtonBox>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'es')"
              >
                <span>Spanish</span>
              </EditorButtonBox>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'fr')"
              >
                <span>French</span>
              </EditorButtonBox>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'de')"
              >
                <span>German</span>
              </EditorButtonBox>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'it')"
              >
                <span>Italian</span>
              </EditorButtonBox>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditorButtonBox
                :active="false"
                @click="() => $emit('translateClick', 'nl')"
              >
                <span>Dutch</span>
              </EditorButtonBox>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
