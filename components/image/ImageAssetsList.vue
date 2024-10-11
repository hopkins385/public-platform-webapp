<script setup lang="ts">
  const props = defineProps<{
    refreshData: boolean;
  }>();

  const emit = defineEmits<{
    reRun: [prompt: string];
    usePrompt: [prompt: string];
    hide: [runId: string];
  }>();

  const runs = ref<any[] | null>(null);
  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewPrompt = ref<string | undefined>(undefined);

  const projectStore = useProjectStore();
  const { getFirstFolderId, getFolderImagesRuns } = useTextToImage();

  async function getImageRuns() {
    const projectId = projectStore.activeProjectId;
    const { data: firstFolder } = await getFirstFolderId({ projectId });
    if (!firstFolder.value?.folderId) {
      throw new Error('No folder found');
    }
    const { data: runs } = await getFolderImagesRuns({
      projectId: projectStore.activeProjectId,
      folderId: firstFolder.value.folderId,
    });
    if (!runs.value) {
      return null;
    }
    return runs.value;
  }

  function previewImage(url: string, prompt?: string) {
    if (!url) {
      return;
    }
    imgPreviewPrompt.value = prompt;
    imgPreviewUrl.value = url;
    showImagePreview.value = true;
  }

  const reRun = (prompt: string) => emit('reRun', prompt);
  const usePrompt = (prompt: string) => emit('usePrompt', prompt);
  const hide = (runId: string) => emit('hide', runId);

  watch(
    () => props.refreshData,
    async (value) => {
      if (value) {
        runs.value = await getImageRuns();
      }
    },
  );

  runs.value = await getImageRuns();

  /*const el = ref<HTMLElement | null>(null);
  const data = ref([1, 2, 3, 4, 5, 6]);

  const { reset } = useInfiniteScroll(
    el,
    () => {
      // load more
      data.value.push(1, 2, 3, 4, 5, 6);
      console.log('load more');
    },
    { distance: 10 },
  );*/

  // onMounted(async () => {
  //   await nextTick();
  //   runs.value = await getImageRuns();
  // });

  const hasRuns = computed(() => runs.value && runs.value.length > 0);
</script>

<template>
  <div class="">
    <ImagePreviewDialog v-model:show="showImagePreview" :img-url="imgPreviewUrl" :prompt="imgPreviewPrompt" />
    <div v-if="hasRuns" ref="el" class="bg-white">
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
          @re-run="reRun"
          @use-prompt="usePrompt"
          @hide="hide"
        />
      </div>
    </div>
    <div v-else>
      <p class="text-center text-sm opacity-50">Let your creativity flow.</p>
    </div>
  </div>
</template>
