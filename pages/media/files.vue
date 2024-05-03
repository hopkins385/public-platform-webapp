<script setup lang="ts">
  const files = ref<File[]>([]);

  // upload files to server
  const upload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('clientFiles', file);
    });
    try {
      const res = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    upload(files.value);
  };
</script>

<template>
  <SectionContainer class="space-y-4 py-10">
    <BoxContainer>
      <FileDropzone v-model="files" />
      <Button class="mt-4" @click="onSubmit">Submit</Button>
    </BoxContainer>
    <BoxContainer>
      <MediaList />
    </BoxContainer>
  </SectionContainer>
</template>
