<script setup lang="ts">
  import { ClipboardCheckIcon, ClipboardIcon, RepeatIcon, SquarePenIcon } from 'lucide-vue-next';
  import { useClipboard, useInfiniteScroll, useScroll } from '@vueuse/core';

  const props = defineProps<{
    refreshData: boolean;
  }>();

  const emit = defineEmits<{
    reRun: [prompt: string];
    usePrompt: [prompt: string];
  }>();

  const runs = ref<any[] | null>(null);
  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewPrompt = ref<string | undefined>(undefined);

  const promptCopy = ref('');

  const {
    copy: copyToClipboard,
    copied: copiedToClipboard,
    isSupported: copyToClipboardSupported,
  } = useClipboard({ source: promptCopy });

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

  function reRun(prompt: string) {
    console.log('Rerun:', prompt);
    emit('reRun', prompt);
  }

  function usePrompt(prompt: string) {
    console.log('prompt:', prompt);
    emit('usePrompt', prompt);
  }

  function copyPromptToClipboard(prompt: string) {
    promptCopy.value = prompt;
    copyToClipboard();
  }

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
            <img v-if="image.path" :src="image.path" alt="image" class="size-full object-contain" loading="lazy" />
            <div v-else class="group size-full bg-stone-100 p-2">
              <p class="hidden text-xs lowercase opacity-50 group-hover:block">{{ image.status }}</p>
            </div>
          </div>
        </div>
        <div class="group flex grow flex-col border-0 px-5">
          <div class="rounded-lg p-1 hover:bg-slate-100">
            <p class="line-clamp-4 max-h-40 min-h-5 break-words text-sm opacity-75 hover:opacity-100">
              {{ run.prompt }}
            </p>
          </div>
          <div class="py-2 opacity-60">
            <span class="rounded-lg bg-stone-100 px-3 py-2 text-xxs">Flux 1.1 Pro</span>
          </div>
          <div class="hidden items-center space-x-1 py-2 group-hover:flex">
            <button
              class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
              @click="reRun(run.prompt)"
            >
              <div>
                <RepeatIcon class="size-4 stroke-1.5" />
              </div>
              <div>Rerun</div>
            </button>
            <button
              class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
              @click="usePrompt(run.prompt)"
            >
              <div>
                <SquarePenIcon class="size-4 stroke-1.5" />
              </div>
              <div>Use</div>
            </button>
            <button
              class="flex items-center justify-center space-x-1 rounded-lg px-2 py-1 text-xs opacity-75 hover:bg-stone-100 hover:opacity-100"
              :disabled="!copyToClipboardSupported"
              @click="copyPromptToClipboard(run.prompt)"
            >
              <div>
                <ClipboardIcon v-if="!copiedToClipboard" class="size-4 stroke-1.5" />
                <ClipboardCheckIcon v-else class="size-4 stroke-1.5" />
              </div>
              <div>Copy</div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-center text-sm opacity-50">Let your creativity flow.</p>
    </div>
  </div>
</template>
