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

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function findAllMediaFor(
    model: {
      id: string;
      type: any;
    },
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(async () => {
      return $client.media.findAllFor.query(
        { model },
        {
          signal: ac.signal,
        },
      );
    }, options);
  }

  function findPaginateAllMediaFor(
    model: {
      id: string;
      type: any;
    },
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(async () => {
      const [media, meta] = await $client.media.paginateFindAllFor.query(
        { model, page },
        {
          signal: ac.signal,
        },
      );
      return { media, meta };
    }, options);
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
      const success = await $fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function uploadMediaFile(file: File, model: { id: string; type: any }) {
    const formData = new FormData();
    formData.append('clientFiles', file);

    throw new Error('Not implemented');

    /*

    const success = await $fetch('/api/file/upload', {
      method: 'POST',
      body: formData,
    });

    const mediaAble = await $client.mediaAble.attachTo.mutate(
      {
        mediaId: files[0]?.id,
        model,
      },
      {
        signal: ac.signal,
      },
    );
    */
  }

  return {
    setPage,
    findAllMediaFor,
    findPaginateAllMediaFor,
    deleteMedia,
    uploadManyFiles,
    uploadMediaFile,
  };
}
