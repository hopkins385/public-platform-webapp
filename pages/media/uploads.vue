<script setup lang="ts">
  definePageMeta({
    title: 'media.meta.uploads.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'Uploads',
      label: 'Uploads',
    },
  });

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
      // const data = await res.json();
      isLoading.value = false;
      refreshData.value = true;
    } catch (err) {
      console.error(err);
      isLoading.value = false;
    }
  };

  const onSubmit = (e: Event) => {
    if (dropzoneFiles.value.length === 0) {
      return;
    }
    e.preventDefault();
    upload(dropzoneFiles.value);
  };
</script>

<template>
  <SectionContainer class="space-y-4">
    <SectionHeading
      title="Uploads"
      subtitle="You can view your uploaded files below."
    />
    <BoxContainer>
      <FileDropzone v-model="dropzoneFiles" />
      <div class="flex justify-end">
        <div class="flex items-center justify-center pt-4">
          <div v-if="isLoading" class="pr-5 text-sm">Uploading...</div>
          <Button :disabled="isLoading" @click="onSubmit">Upload Files</Button>
        </div>
      </div>
    </BoxContainer>
    <BoxContainer>
      <MediaList v-model:refresh="refreshData" />
    </BoxContainer>
    <div class="h-1"></div>
  </SectionContainer>
</template>
