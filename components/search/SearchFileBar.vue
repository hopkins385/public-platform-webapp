<script setup lang="ts">
  import { Loader2Icon } from 'lucide-vue-next';
  defineProps<{
    pending: boolean;
    submitDisabled: boolean;
  }>();
  defineEmits<{
    submit: [void];
  }>();
  const modelValue = defineModel<{ modelValue: string }>();
</script>

<template>
  <form class="flex items-center pb-4" @submit.prevent="$emit('submit')">
    <div class="relative mr-2 w-full">
      <div class="absolute right-1 top-1/2 -translate-y-1/2">
        <Loader2Icon
          v-if="pending"
          class="mr-2 inline-block size-6 animate-spin text-slate-500"
        />
      </div>
      <Input
        v-model="modelValue"
        :placeholder="$t('file.search.placeholder')"
        class="w-full rounded-2xl py-6"
      />
    </div>
    <Button type="submit" :disabled="submitDisabled">
      {{ $t('file.search.button') }}
    </Button>
  </form>
</template>
