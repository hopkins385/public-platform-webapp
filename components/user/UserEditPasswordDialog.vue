<script setup lang="ts">
  const open = ref(false);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger>
      <Button class="whitespace-nowrap" variant="outline">
        Edit Password
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit password</DialogTitle>
        <DialogDescription>
          Make changes to your password here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <UserEditPasswordForm @success="open = false" />
    </DialogContent>
  </Dialog>
</template>
