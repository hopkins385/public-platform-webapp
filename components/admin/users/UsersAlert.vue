<script setup lang="ts">
  import { TriangleAlertIcon } from 'lucide-vue-next';
</script>

<template>
  <Alert>
    <TriangleAlertIcon class="h-4 w-4" />
    <AlertTitle>Heads Up!</AlertTitle>
    <AlertDescription>
      <slot />
    </AlertDescription>
  </Alert>
</template>
