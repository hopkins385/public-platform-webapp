<script setup lang="ts">
  import { SendIcon } from 'lucide-vue-next';

  const isLoading = ref(false);
  const refresh = ref(false);
  const prompt = ref('');
  const loadingPrompt = ref('');
  const imageUrls = ref<string[] | null>(null);

  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewName = ref('');

  const promptFormRef = ref<HTMLFormElement | null>(null);

  const projectStore = useProjectStore();
  const settings = useImgGenSettingsStore();
  const { generateImages, getFirstFolderId } = useTextToImage();

  async function generateImage(submitPrompt: string) {
    prompt.value = '';
    loadingPrompt.value = submitPrompt;
    isLoading.value = true;
    try {
      const projectId = projectStore.activeProjectId;
      const { data: firstFolder } = await getFirstFolderId({ projectId });
      if (!firstFolder.value?.folderId) {
        throw new Error('No folder found');
      }
      const { data: res } = await generateImages({
        folderId: firstFolder.value.folderId,
        prompt: submitPrompt,
        imgCount: settings.getImageCount,
        width: settings.getImageWidth,
        height: settings.getImageHeight,
        guidance: settings.getImageGuidance,
        prompt_upsampling: settings.getPromptUpsampling,
      });
      return res.value;
    } finally {
      await refreshData();
      loadingPrompt.value = '';
      isLoading.value = false;
    }
  }

  async function refreshData() {
    // set refreshData to true to force the ImageAssetsList component to refresh
    // set it back to false after the refresh is done
    refresh.value = true;
    await nextTick();
    refresh.value = false;
  }

  async function onSubmit() {
    imageUrls.value = await generateImage(prompt.value);
  }

  function openImage(imgName: string, url: string) {
    imgPreviewName.value = imgName;
    imgPreviewUrl.value = url;
    showImagePreview.value = true;
  }

  function selectText(event: MouseEvent) {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  function usePrompt(value: string) {
    prompt.value = value;
    nextTick(() => {
      adjustTextareaHeight();
    });
    promptFormRef.value?.querySelector('textarea')?.focus();
  }

  /**
   * Adjusts the height of the textarea based on its content.
   */
  const adjustTextareaHeight = () => {
    const maxHeight = 364;
    const textarea = promptFormRef.value?.querySelector('textarea');
    if (textarea) {
      // Reset height to auto to calculate the new height
      textarea.style.height = 'auto';
      // Set the height to match the scrollHeight
      textarea.style.height = `${Math.min(maxHeight, textarea.scrollHeight)}px`;
    }
  };

  /**
   * Handles the paste event to clean pasted text by removing excessive empty lines.
   */
  const handlePaste = (event: ClipboardEvent) => {
    // Prevent the default paste behavior
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (clipboardData) {
      // Retrieve the plain text from the clipboard
      let pastedText = clipboardData.getData('text/plain');

      // Process the pasted text:
      // Replace multiple consecutive empty lines with a single empty line
      // This regex replaces 3 or more consecutive newline characters with 2
      pastedText = pastedText.replace(/(\r?\n){3,}/g, '\n\n');

      // Alternatively, to remove all empty lines, use:
      // pastedText = pastedText.replace(/^\s*[\r\n]/gm, '');

      const textarea = promptFormRef.value?.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = prompt.value.substring(0, start);
        const after = prompt.value.substring(end);

        // Insert the cleaned pasted text at the cursor position
        prompt.value = before + pastedText + after;

        // Move the cursor to the end of the inserted text
        nextTick(() => {
          const cursorPosition = start + pastedText.length;
          textarea.selectionStart = textarea.selectionEnd = cursorPosition;
          adjustTextareaHeight();
        });
      }
    }
  };

  let observer: ResizeObserver | null = null;

  onMounted(() => {
    const textarea = promptFormRef.value?.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
    adjustTextareaHeight();
    const section = document.getElementById('sectionContainer');
    if (section) {
      observer = new ResizeObserver(() => {
        adjustTextareaHeight();
      });
      observer.observe(section);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });
</script>

<template>
  <div id="sectionContainer" class="bg-white">
    <SectionContainer class="sticky inset-0 z-10 !py-0">
      <div class="h-8 bg-white/95 backdrop-blur-sm"></div>
      <div class="w-full">
        <div class="flex h-fit w-full space-x-4 rounded-b-lg bg-white/95 pb-1 backdrop-blur-sm">
          <form ref="promptFormRef" class="relative grow space-y-2" @submit.prevent="onSubmit">
            <Textarea
              v-model="prompt"
              type="text"
              placeholder="Enter a prompt"
              rows="1"
              resize="none"
              class="min-h-[48px] resize-none rounded-2xl bg-white py-4 pl-4 pr-8 shadow-sm focus:shadow-lg"
              @input="adjustTextareaHeight"
              @paste="handlePaste"
            />
            <div class="absolute bottom-0 right-0 p-1">
              <Button class="z-10" type="submit" size="icon" variant="ghost">
                <SendIcon class="size-5 stroke-1.5 opacity-75" />
              </Button>
            </div>
          </form>
          <div id="settings" class="pt-2">
            <ImageGenSettings />
          </div>
        </div>
      </div>
    </SectionContainer>
    <SectionContainer>
      <div v-if="isLoading" class="flex">
        <div class="grid shrink-0 grid-cols-4">
          <div
            v-for="(count, index) in settings.getImageCount"
            :key="index"
            class="mx-1 flex size-56 animate-pulse rounded-lg bg-stone-100"
          ></div>
        </div>
        <div class="group flex grow flex-col border-0 px-5">
          <div class="rounded-lg p-1 hover:bg-slate-100">
            <p class="line-clamp-4 max-h-40 min-h-5 break-words text-sm opacity-75 hover:opacity-100">
              {{ loadingPrompt }}
            </p>
          </div>
        </div>
      </div>
      <ImageAssetsList :refresh-data="refresh" @re-run="async (p) => await generateImage(p)" @use-prompt="usePrompt" />
    </SectionContainer>
  </div>
</template>
