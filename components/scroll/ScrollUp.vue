<script setup lang="ts">
  import { MoveUpIcon } from 'lucide-vue-next';

  defineProps<{
    show: boolean;
  }>();

  const { scrollToTop } = useScrollTo();
</script>

<template>
  <div class="fixed bottom-10 right-10 z-10 ml-auto flex items-center justify-center border-0">
    <button
      v-show="show"
      class="flex size-8 items-center justify-center rounded-full border"
      @click="() => scrollToTop()"
    >
      <MoveUpIcon class="size-4 text-stone-400" />
    </button>
  </div>
</template>
