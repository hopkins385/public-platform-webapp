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
    return useAsyncData(async () => {
      const { folderId, prompt, imgCount, width, height, guidance, prompt_upsampling } = payload;
      return await $client.textToImage.generateImages.query(
        {
          folderId,
          prompt,
          imgCount,
          width,
          height,
          guidance,
          prompt_upsampling,
        },
        {
          signal: ac.signal,
        },
      );
    });
  }

  async function getFirstFolderId(payload: { projectId: string }) {
    return useAsyncData(async () => {
      return await $client.textToImage.getFirstFolderId.query(
        {
          projectId: payload.projectId,
        },
        { signal: ac.signal },
      );
    });
  }

  return {
    getFirstFolderId,
    generateImages,
  };
}
