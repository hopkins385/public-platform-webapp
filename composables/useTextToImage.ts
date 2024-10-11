export default function useTextToImage() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

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

  async function getFolderImagesRuns(payload: { projectId: string; folderId: string }) {
    const { projectId, folderId } = payload;
    return useAsyncData(`folderImages:${folderId}`, async () => {
      return await $client.textToImage.getFolderImagesRuns.query(
        {
          projectId,
          folderId,
        },
        { signal: ac.signal },
      );
    });
  }

  async function hideRun(payload: { runId: string; projectId: string }) {
    const { runId, projectId } = payload;
    return $client.textToImage.deleteRun.query(
      {
        runId,
        projectId,
      },
      { signal: ac.signal },
    );
  }

  return {
    generateImages,
    getFirstFolderId,
    getFolderImagesRuns,
    hideRun,
  };
}
