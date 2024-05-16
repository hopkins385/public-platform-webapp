<script setup lang="ts">
  defineProps<{
    title: string | undefined | null;
    subtitle?: string;
  }>();

  defineEmits<{
    'update:title': [string];
    'update:subtitle': [string];
  }>();
</script>

<template>
  <div class="flex items-center justify-between pb-4">
    <div>
      <h1
        class="rounded-xl p-2 text-2xl font-bold focus:outline-stone-200"
        contenteditable="true"
        @input="(e) => $emit('update:title', e.target.innerText)"
      >
        {{ title ?? '' }}
      </h1>
      <p
        class="rounded-xl p-2 text-sm text-gray-500 focus:outline-stone-200"
        contenteditable="true"
        @input="(e) => $emit('update:subtitle', e.target.innerText)"
      >
        {{ subtitle ?? '' }}
      </p>
    </div>
    <div>
      <slot name="button" />
    </div>
  </div>
</template>
