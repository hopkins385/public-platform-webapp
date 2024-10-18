<script setup lang="ts">
  import { useInfiniteScroll } from '@vueuse/core';
  const { setPage, getRandomImagesPaginated } = useTextToImage();

  const { data, status } = await getRandomImagesPaginated();

  const runs = ref(data.value?.runs || []);
  const hasRuns = computed(() => runs.value && runs.value.length > 0);
  const meta = computed(() => data.value?.meta);

  const handleNextScroll = async () => {
    if (!hasRuns.value || status.value === 'pending' || !meta.value?.nextPage) return;
    setPage(meta.value.nextPage);
  };

  function initInfiniteScroll() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return;
    const { reset } = useInfiniteScroll(mainContainer, handleNextScroll, { distance: 100 });
  }

  watch(
    () => data.value,
    (result) => {
      runs.value?.push(...(result?.runs || []));
    },
  );

  onMounted(() => {
    initInfiniteScroll();
  });
</script>

<template>
  <SectionContainer>
    <div class="bento-grid">
      <div v-for="run in runs" :key="run.id" class="bento-item">
        <div v-for="img in run.images" :key="img.id" class="image-container group">
          <img v-if="img.path.length > 10" :src="img.path" class="h-auto w-full" />
          <div class="image-prompt-container hidden group-hover:block">
            <ImageExplorePromptContainer :prompt="run.prompt" />
          </div>
        </div>
      </div>
    </div>
  </SectionContainer>
</template>

<style scoped>
  .bento-grid {
    column-count: 4;
    column-gap: 2px;
    border-radius: 1rem;
    overflow: hidden;
  }

  .bento-item {
    break-inside: avoid;
    margin-bottom: 2px;
  }

  .image-container {
    position: relative;
    width: 100%;
    margin-bottom: 2px;
  }

  .image-container img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 0.25rem;
  }

  .image-prompt-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.9);
    padding: 0.5rem;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
</style>
