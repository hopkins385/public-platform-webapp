<script setup lang="ts">
  const { $client } = useNuxtApp();

  const isLoading = ref(false);
  const prompt = ref('A beautiful sunset over the ocean');
  const imageUrls = ref<string[] | null>(null);

  async function generateImage(prompt: string) {
    isLoading.value = true;
    try {
      const res = await $client.imageGen.generateImage.query({
        prompt,
      });
      console.log(res);
      return res;
    } finally {
      isLoading.value = false;
    }
  }

  async function onSubmit() {
    imageUrls.value = await generateImage(prompt.value);
  }
</script>

<template>
  <div class="space-y-4 p-10">
    <form class="space-y-2" @submit.prevent="onSubmit">
      <Input v-model="prompt" type="text" placeholder="Enter a prompt" />
      <LoadingButton type="submit" :is-loading="isLoading">Imagine</LoadingButton>
    </form>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="imageUrls" class="grid w-fit grid-cols-2 gap-4 bg-black p-10">
      <div v-for="(imageUrl, index) in imageUrls" :key="index" class="h-96 w-96 overflow-hidden">
        <img :src="imageUrl" alt="Generated Image" class="size-full" />
      </div>
    </div>
  </div>
</template>
