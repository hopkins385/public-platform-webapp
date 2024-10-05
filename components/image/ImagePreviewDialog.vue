<script setup lang="ts">
  const props = defineProps<{
    show: boolean;
    imgSrc: string;
  }>();

  defineEmits<{
    'update:show': [value: boolean];
  }>();

  const onDownload = () => {
    const link = document.createElement('a');
    link.href = props.imgSrc;
    const imageName = props.imgSrc.split('/').pop() || 'image.jpg';
    link.download = imageName;
    link.click();
  };
</script>

<template>
  <Dialog :open="show" :modal="true" @update:open="() => $emit('update:show', false)">
    <DialogContent class="flex h-[90dvh] max-w-4xl flex-col">
      <DialogHeader>
        <DialogTitle>Image</DialogTitle>
        <DialogDescription> Click download image to store it on your local disk. </DialogDescription>
      </DialogHeader>

      <div class="flex-grow overflow-hidden">
        <div class="flex h-full w-full items-center justify-center" @click="onDownload">
          <img :src="imgSrc" alt="Generated Image" class="max-h-full max-w-full object-contain" />
        </div>
      </div>

      <DialogFooter></DialogFooter>
    </DialogContent>
  </Dialog>
</template>
