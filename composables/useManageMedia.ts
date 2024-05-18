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

  let page: number = 1;
  let limit: number = 10;

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setLimit(l: number) {
    limit = l;
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
          { model, limit, page },
          {
            signal: ac.signal,
          },
        );
        return { media, meta };
      },
      options,
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

  async function uploadManyFiles(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('clientFiles', file);
    });
    try {
      return await $fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function attachMediaTo(model: any, media: any) {
    return $client.media.attachTo.mutate(
      { model, media },
      {
        signal: ac.signal,
      },
    );
  }

  function detachMediaFrom(model: any, media: any) {
    return $client.media.detachFrom.mutate(
      { model, media },
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
