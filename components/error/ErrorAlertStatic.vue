<script setup lang="ts">
  import { AlertCircleIcon } from 'lucide-vue-next';

  defineProps<{
    message: string;
  }>();
</script>

<template>
  <div class="-mt-10 p-10">
    <Alert variant="destructive" class="bg-white shadow-md">
      <AlertCircleIcon class="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {{ message }}
      </AlertDescription>
    </Alert>
  </div>
</template>
