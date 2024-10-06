<script setup lang="ts">
  import { DownloadIcon, Loader2Icon, LoaderIcon } from 'lucide-vue-next';

  const props = defineProps<{
    show: boolean;
    imgUrl: string;
    prompt?: string;
  }>();

  defineEmits<{
    'update:show': [value: boolean];
  }>();

  const isLoading = ref(false);

  async function downloadImage(): Promise<void> {
    // Fetch the image
    await $fetch(props.imgUrl, {
      method: 'GET',
      responseType: 'blob',
      onRequest: (req) => {
        isLoading.value = true;
      },
      // Get the blob from the response
      onResponse: async (res) => {
        const blob = res.response._data;
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;

        // Set the download attribute with a filename
        link.download = getFilenameFromUrl(props.imgUrl);

        // Append to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the temporary URL
        window.URL.revokeObjectURL(url);
      },
      onRequestError: (error) => {
        console.error('Error downloading image:', error);
      },
      onResponseError: (error) => {
        console.error('Error downloading image:', error);
      },
    }).finally(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      isLoading.value = false;
    });
  }

  function getFilenameFromUrl(url: string): string {
    // Extract filename from URL or use a default name
    const defaultName = 'image.jpg';
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const filename = pathname.split('/').pop();
      return filename || defaultName;
    } catch {
      return defaultName;
    }
  }

  function openImage(url: string): void {
    // save image as..
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = getFilenameFromUrl(url);
    link.click();
    document.body.removeChild(link);
  }
</script>

<template>
  <Dialog :open="show" :modal="true" @update:open="() => $emit('update:show', false)">
    <DialogContent class="flex h-[90dvh] max-w-4xl flex-col">
      <DialogHeader class="flex w-full flex-row items-center justify-between border-0">
        <div>
          <DialogTitle>Image</DialogTitle>
          <DialogDescription> {{ prompt }} </DialogDescription>
        </div>
        <div class="my-2 ml-4 mr-2 shrink-0">
          <Button size="icon" variant="default" class="p-2" @click="() => openImage(imgUrl)">
            <DownloadIcon v-if="!isLoading" class="size-5" />
            <Loader2Icon v-else class="size-5 animate-spin" />
          </Button>
        </div>
      </DialogHeader>

      <div class="flex-grow overflow-hidden">
        <div
          class="relative flex h-full w-full items-center justify-center hover:cursor-pointer"
          @click="() => openImage(imgUrl)"
        >
          <img :src="imgUrl" alt="Generated Image" class="max-h-full max-w-full rounded-md object-contain" />
        </div>
      </div>

      <DialogFooter></DialogFooter>
    </DialogContent>
  </Dialog>
</template>
