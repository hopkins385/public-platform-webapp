<script setup lang="ts">
  const projectStore = useProjectStore();
  const { getFirstFolderId, getFolderImagesRuns } = useTextToImage();

  const runs = ref<any[] | null>(null);

  async function getImages() {
    const projectId = projectStore.activeProjectId;
    const { data: firstFolder } = await getFirstFolderId({ projectId });
    if (!firstFolder.value?.folderId) {
      throw new Error('No folder found');
    }
    const { data: runs } = await getFolderImagesRuns({ folderId: firstFolder.value.folderId });
    if (!runs.value) {
      return null;
    }
    return runs.value;
  }

  function openImage(url: string) {
    imgPreviewSrc.value = url;
    showImagePreview.value = true;
  }

  const showImagePreview = ref(false);
  const imgPreviewSrc = ref('');

  runs.value = await getImages();
</script>

<template>
  <ImagePreviewDialog v-model:show="showImagePreview" :img-src="imgPreviewSrc" />
  <SectionContainer>
    <div v-if="runs">
      <div v-for="run in runs" :key="run.id" class="my-2 grid grid-cols-2 border">
        <div v-if="run.status === 'FAILED'">FAILED</div>
        <div v-for="image in run.images" :key="image.id" class="h-72" @click="openImage(image.path)">
          <img :src="image.path" alt="image" class="size-full object-contain" />
        </div>
        <div>
          <p class="text-sm">{{ run.prompt }}</p>
        </div>
      </div>
    </div>
  </SectionContainer>
</template>
