<script setup lang="ts">
  defineProps<{
    modelValue: boolean;
  }>();

  defineEmits<{
    'update:modelValue': [boolean];
    confirm: [boolean];
  }>();
</script>

<template>
  <AlertDialog
    :open="modelValue"
    @update:open="(val) => $emit('update:modelValue', val)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Not Yet Available</AlertDialogTitle>
        <AlertDialogDescription>
          This feature is not yet implemented.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="$emit('confirm', true)">
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
