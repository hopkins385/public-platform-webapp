<script setup lang="ts">
  import { SendIcon } from 'lucide-vue-next';

  const isLoading = ref(false);
  const prompt = ref('');
  const imageUrls = ref<string[] | null>(null);

  const showImagePreview = ref(false);
  const imgPreviewUrl = ref('');
  const imgPreviewName = ref('');

  const promptFormRef = ref<HTMLFormElement | null>(null);

  const config = reactive({
    imgCount: 4,
    width: 1024,
    height: 1024,
    guidance: 2.5,
    prompt_upsampling: false,
  });

  const projectStore = useProjectStore();
  const { generateImages, getFirstFolderId } = useTextToImage();

  async function generateImage(prompt: string) {
    isLoading.value = true;
    try {
      const projectId = projectStore.activeProjectId;
      const { data: firstFolder } = await getFirstFolderId({ projectId });
      if (!firstFolder.value?.folderId) {
        throw new Error('No folder found');
      }
      const { data: res } = await generateImages({
        folderId: firstFolder.value.folderId,
        prompt,
        imgCount: config.imgCount,
        width: config.width,
        height: config.height,
        guidance: config.guidance,
        prompt_upsampling: config.prompt_upsampling,
      });
      return res.value;
    } finally {
      isLoading.value = false;
    }
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

  onMounted(() => {
    const textarea = promptFormRef.value?.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  });

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

  // Watch for changes in the prompt and adjust height accordingly
  watch(prompt, () => {
    adjustTextareaHeight();
  });

  let observer: ResizeObserver | null = null;

  onMounted(() => {
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
    <SectionContainer class="sticky inset-0 !py-0">
      <div class="h-8 bg-white/95 backdrop-blur-sm"></div>
      <div class="flex space-x-4">
        <div id="left" class="w-full">
          <div class="h-fit rounded-b-lg bg-white/95 pb-1 backdrop-blur-sm">
            <form ref="promptFormRef" class="relative space-y-2" @submit.prevent="onSubmit">
              <Textarea
                v-model="prompt"
                type="text"
                placeholder="Enter a prompt"
                rows="1"
                resize="none"
                class="min-h-[48px] resize-none rounded-2xl py-4 pl-4 pr-8 shadow-sm focus:shadow-lg"
                @input="adjustTextareaHeight"
                @paste="handlePaste"
              />
              <div class="absolute bottom-0 right-0 p-1">
                <Button class="z-10" type="submit" size="icon" variant="ghost">
                  <SendIcon class="size-5 stroke-1.5" />
                </Button>
              </div>
            </form>
          </div>
          <div v-if="isLoading">Loading...</div>
          <div v-else-if="imageUrls" class="grid w-fit grid-cols-2 gap-4 bg-black p-10">
            <div v-for="(imageUrl, index) in imageUrls" :key="index" class="h-96 w-96 overflow-hidden">
              <img
                :src="imageUrl"
                alt="Generated Image"
                class="size-full hover:cursor-pointer"
                @click="openImage('', imageUrl)"
              />
            </div>
          </div>
        </div>
        <BoxContainer class="hidden w-96">
          <h2>Settings</h2>
          <Input v-model="config.imgCount" type="number" placeholder="Number of images" />
          <Input v-model="config.width" type="number" placeholder="Width" />
          <Input v-model="config.height" type="number" placeholder="Height" />
          <Input v-model="config.guidance" type="number" step="0.5" placeholder="Guidance" />
          <div>
            <label>Prompt Upsampling </label>
            <Checkbox
              :checked="config.prompt_upsampling"
              @update:checked="(value) => (config.prompt_upsampling = value)"
            />
          </div>
        </BoxContainer>
      </div>
    </SectionContainer>
    <SectionContainer class="">
      <ImageAssetsList />
    </SectionContainer>
  </div>
</template>
