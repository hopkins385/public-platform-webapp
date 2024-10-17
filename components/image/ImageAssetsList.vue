<script setup lang="ts">
  import { useInfiniteScroll } from '@vueuse/core';

  const props = defineProps<{
    refreshData: boolean;
  }>();

  defineEmits<{
    reRun: [prompt: string];
    usePrompt: [prompt: string];
    toggleHide: [runId: string];
  }>();

  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewPrompt = ref<string | undefined>(undefined);

  const settings = useImgGenSettingsStore();

  const projectStore = useProjectStore();
  const { getFirstFolderId, getFolderImagesRunsPaginated, setPage } = useTextToImage();

  const projectId = projectStore.activeProjectId;
  const { data: firstFolder } = await getFirstFolderId({ projectId });
  if (!firstFolder.value?.folderId) {
    throw new Error('No folder found');
  }
  const { data, refresh, status } = await getFolderImagesRunsPaginated({
    projectId: projectStore.activeProjectId,
    folderId: firstFolder.value.folderId,
  });

  const runs = ref(data.value?.runs || []);
  const hasRuns = computed(() => runs.value && runs.value.length > 0);
  const meta = computed(() => data.value?.meta);

  function previewImage(url: string, prompt?: string) {
    if (!url) {
      return;
    }
    imgPreviewPrompt.value = prompt;
    imgPreviewUrl.value = url;
    showImagePreview.value = true;
  }

  async function resetPageData() {
    console.log('refreshing');
    setPage(1);
    await refresh();
    runs.value = data.value?.runs || [];
  }

  function initInfiniteScroll() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return;
    const { reset } = useInfiniteScroll(
      mainContainer,
      () => {
        if (!hasRuns.value || status.value === 'pending' || !meta.value?.nextPage) return;
        setPage(meta.value.nextPage);
      },
      { distance: 100 },
    );
  }

  watch(
    () => props.refreshData,
    async (value) => {
      if (value) {
        await resetPageData();
      }
    },
  );

  watch(
    () => data.value,
    (result) => {
      runs.value?.push(...(result?.runs || []));
    },
  );

  watch(
    () => settings.getShowHidden,
    async () => await resetPageData(),
  );

  onMounted(() => {
    initInfiniteScroll();
  });
</script>

<template>
  <div class="bg-white">
    <ImagePreviewDialog v-model:show="showImagePreview" :img-url="imgPreviewUrl" :prompt="imgPreviewPrompt" />
    <div v-if="hasRuns" id="runContainer" class="">
      <div v-for="run in runs" :key="run.id" class="my-2 flex">
        <div class="grid shrink-0 grid-cols-4">
          <div
            v-for="image in run.images"
            :key="image.id"
            class="mx-1 flex size-56 overflow-hidden rounded-lg border border-transparent hover:cursor-pointer hover:shadow-xl"
            @click="previewImage(image.path, run.prompt)"
          >
            <img
              v-if="image.path"
              :src="image.path"
              alt="image"
              class="size-full rounded-lg object-contain"
              loading="lazy"
            />
            <div v-else class="group size-full bg-stone-100 p-2">
              <p class="hidden text-xs lowercase opacity-50 group-hover:block">{{ image.status }}</p>
            </div>
          </div>
        </div>
        <ImageAssetsOptionsBar
          :prompt="run.prompt"
          :run-id="run.id"
          :is-hidden="run.deletedAt !== null"
          @re-run="(val) => $emit('reRun', val)"
          @use-prompt="(val) => $emit('usePrompt', val)"
          @toggle-hide="(val) => $emit('toggleHide', val)"
        />
      </div>
    </div>
    <div v-else>
      <p class="text-center text-sm opacity-50">Let your creativity flow.</p>
    </div>
  </div>
</template>
