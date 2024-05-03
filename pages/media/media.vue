<script setup lang="ts">
  const { createMedia } = useManageMedia();

  async function onSubmit() {
    console.log('Creating media...');
    await createMedia({
      name: 'My Media',
      fileName: 'my-media.jpg',
      filePath: 'https://example.com/my-media.jpg',
      fileMime: 'image/jpeg',
      fileSize: 1024,
    });
  }
</script>

<template>
  <div>
    <Button @click="onSubmit">Submit</Button>
  </div>
</template>
