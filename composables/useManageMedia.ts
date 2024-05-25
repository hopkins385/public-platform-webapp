import type { AsyncDataOptions } from '#app';

export interface ICreateMedia {
  name: string;
  fileName: string;
  filePath: string;
  fileMime: string;
  fileSize: number;
}

export default function useManageMedia() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  const page = ref<number>(1);
  const limit = ref<number>(10);

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page.value = p;
  }

  function setLimit(l: number) {
    limit.value = l;
  }

  function findAllMediaFor(
    model: {
      id: string;
      type: any;
    },
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(
      `allMediaFor:${JSON.stringify(model)}`,
      async () => {
        return $client.media.findAllFor.query(
          { model },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  function findPaginateAllMediaFor(
    model: {
      id: string;
      type: any;
    },
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(
      `allMediaPaginatedFor:${JSON.stringify(model)}`,
      async () => {
        const [media, meta] = await $client.media.paginateFindAllFor.query(
          { model, limit: limit.value, page: page.value },
          {
            signal: ac.signal,
          },
        );
        return { media, meta };
      },
      {
        watch: [page, limit],
        ...options,
      },
    );
  }

  function deleteMedia(id: string) {
    return $client.media.delete.mutate(
      { mediaId: id },
      {
        signal: ac.signal,
      },
    );
  }

  async function uploadManyFiles(files: File[], vision: boolean = false) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('clientFiles', file);
    });
    formData.append('vision', vision.toString());
    try {
      return await $fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function attachMediaTo(mediaId: string, model: any) {
    return $client.mediaAble.attachTo.mutate(
      { mediaId, model },
      {
        signal: ac.signal,
      },
    );
  }

  function detachMediaFrom(model: any) {
    return $client.mediaAble.detachFrom.mutate(
      { model },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    setPage,
    setLimit,
    findAllMediaFor,
    findPaginateAllMediaFor,
    deleteMedia,
    uploadManyFiles,
    attachMediaTo,
    detachMediaFrom,
  };
}
