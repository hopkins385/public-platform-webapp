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
  <Dialog
    :open="modelValue"
    @update:open="(val) => $emit('update:modelValue', val)"
  >
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add file to collection</DialogTitle>
        <DialogDescription>
          Choose a collection to add this file to.
        </DialogDescription>
      </DialogHeader>
      <div>here</div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:modelValue', false)">
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
