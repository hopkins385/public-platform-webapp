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
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the data
          from our servers.
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
