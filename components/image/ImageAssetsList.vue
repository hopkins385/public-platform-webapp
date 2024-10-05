<script setup lang="ts">
  const runs = ref<any[] | null>(null);
  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewName = ref('');

  const projectStore = useProjectStore();
  const { getFirstFolderId, getFolderImagesRuns } = useTextToImage();

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

  function openImage(imgName: string, url: string) {
    imgPreviewName.value = imgName;
    imgPreviewUrl.value = url;
    showImagePreview.value = true;
  }

  runs.value = await getImages();
</script>

<template>
  <div>
    <ImagePreviewDialog v-model:show="showImagePreview" :img-url="imgPreviewUrl" :img-name="imgPreviewName" />
    <div v-if="runs">
      <div v-for="run in runs" :key="run.id" class="my-2 flex">
        <div class="grid shrink-0 grid-cols-4">
          <div v-if="run.status === 'FAILED'">FAILED</div>
          <div
            v-for="image in run.images"
            :key="image.id"
            class="mx-1 flex size-56 overflow-hidden rounded-sm border border-transparent hover:cursor-pointer hover:shadow-xl"
            @click="openImage(image.name, image.path)"
          >
            <img :src="image.path" alt="image" class="size-full object-contain" />
          </div>
        </div>
        <div class="group flex flex-col justify-between border-0 px-5">
          <div class="rounded-lg p-1 hover:bg-slate-100">
            <p class="line-clamp-4 max-h-40 min-h-5 break-words text-sm">{{ run.prompt }}</p>
          </div>
          <div class="group-hover:block">here</div>
        </div>
      </div>
    </div>
  </div>
</template>
