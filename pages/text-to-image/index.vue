<script setup lang="ts">
  const isLoading = ref(false);
  const prompt = ref('A beautiful sunset over the ocean');
  const imageUrls = ref<string[] | null>(null);

  const config = reactive({
    imgCount: 2,
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

  function openImage(url: string) {
    window.open(url, '_blank');
  }
</script>

<template>
  <SectionContainer>
    <div class="flex space-x-4">
      <div id="left" class="w-full">
        <BoxContainer class="h-fit">
          <form class="space-y-2" @submit.prevent="onSubmit">
            <Textarea v-model="prompt" type="text" placeholder="Enter a prompt" />
            <LoadingButton type="submit" :is-loading="isLoading">Generate Image</LoadingButton>
          </form>
        </BoxContainer>
        <div v-if="isLoading">Loading...</div>
        <div v-else-if="imageUrls" class="grid w-fit grid-cols-2 gap-4 bg-black p-10">
          <div v-for="(imageUrl, index) in imageUrls" :key="index" class="h-96 w-96 overflow-hidden">
            <img
              :src="imageUrl"
              alt="Generated Image"
              class="size-full hover:cursor-pointer"
              @click="openImage(imageUrl)"
            />
          </div>
        </div>
      </div>
      <BoxContainer class="w-96">
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
</template>
