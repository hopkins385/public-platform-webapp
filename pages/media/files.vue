<script setup lang="ts">
  const refreshData = ref(false);
  const isLoading = ref(false);
  const dropzoneFiles = ref<File[]>([]);

  const emits = defineEmits<{
    refresh: [void];
  }>();

  // upload files to server
  const upload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('clientFiles', file);
    });
    try {
      isLoading.value = true;
      dropzoneFiles.value = [];
      const res = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log(data);
      isLoading.value = false;
      refreshData.value = true;
    } catch (err) {
      console.error(err);
      isLoading.value = false;
    }
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    upload(dropzoneFiles.value);
  };
</script>

<template>
  <SectionContainer class="space-y-4 py-10">
    <BoxContainer>
      <FileDropzone v-model="dropzoneFiles" />
      <Button class="mt-4" @click="onSubmit">Submit</Button>
      <div v-if="isLoading" class="mt-4">Uploading...</div>
    </BoxContainer>
    <BoxContainer>
      <MediaList v-model:refresh="refreshData" />
    </BoxContainer>
  </SectionContainer>
</template>
