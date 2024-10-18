export default function useTextToImage() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();
  const settings = useImgGenSettingsStore();

  const page = ref(1);

  // const showDeletedRuns = computed(() => settings.getShowHidden);

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(value: number) {
    page.value = value;
  }

  function getPage() {
    return page.value;
  }

  async function generateImages(payload: {
    folderId: string;
    prompt: string;
    imgCount: number;
    width: number;
    height: number;
    guidance: number;
    prompt_upsampling: boolean;
  }) {
    const { folderId, prompt, imgCount, width, height, guidance, prompt_upsampling } = payload;
    return useAsyncData(async () => {
      return await $client.textToImage.generateImages.query(
        {
          folderId,
          prompt,
          imgCount,
          width,
          height,
          guidance,
          prompt_upsampling,
          safety_tolerance: 4,
        },
        {
          signal: ac.signal,
        },
      );
    });
  }

  async function getFirstFolderId(payload: { projectId: string }) {
    const { projectId } = payload;
    return useAsyncData(`firstFolder:${projectId}`, async () => {
      return await $client.textToImage.getFirstFolderId.query(
        {
          projectId,
        },
        { signal: ac.signal },
      );
    });
  }

  /*async function getFolderImagesRuns(payload: { projectId: string; folderId: string }) {
    const { projectId, folderId } = payload;
    return useAsyncData(
      `folderImages:${folderId}`,
      async () => {
        return await $client.textToImage.getFolderImagesRuns.query(
          {
            projectId,
            folderId,
            showDeleted: showDeletedRuns.value,
          },
          { signal: ac.signal },
        );
      },
      {
        watch: [showDeletedRuns],
      },
    );
  }*/

  async function getFolderImagesRunsPaginated(payload: { projectId: string; folderId: string }) {
    const { projectId, folderId } = payload;
    return useAsyncData(
      `folderImagesPaginated:${folderId}-page:${page.value}-showDeleted:${settings.getShowHidden}`,
      async () => {
        const [runs, meta] = await $client.textToImage.getFolderImagesRunsPaginated.query(
          {
            projectId,
            folderId,
            page: page.value,
            showDeleted: settings.getShowHidden,
          },
          { signal: ac.signal },
        );
        return { runs, meta };
      },
      {
        watch: [page],
      },
    );
  }

  async function toggleHideRun(payload: { runId: string; projectId: string }) {
    const { runId, projectId } = payload;
    return $client.textToImage.toggleHideRun.query(
      {
        runId,
        projectId,
      },
      { signal: ac.signal },
    );
  }

  async function getRandomImagesPaginated() {
    return useAsyncData(
      `randomImagesPaginated:page:${page.value}`,
      async () => {
        const [runs, meta] = await $client.textToImage.getRandomImagesPaginated.query(
          {
            page: page.value,
          },
          { signal: ac.signal },
        );
        return { runs, meta };
      },
      {
        watch: [page],
      },
    );
  }

  return {
    getPage,
    setPage,
    generateImages,
    getFirstFolderId,
    // getFolderImagesRuns,
    getFolderImagesRunsPaginated,
    getRandomImagesPaginated,
    toggleHideRun,
  };
}
