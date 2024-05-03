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
  let mediaId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setMediaId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    mediaId = id;
  }

  function createMedia(payload: ICreateMedia) {
    return $client.media.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function findAllMediaFor(
    model: {
      id: string;
      type: 'User' | 'Document' | 'Project';
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
      type: 'User' | 'Document' | 'Project';
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

  return {
    setPage,
    setMediaId,
    createMedia,
    findAllMediaFor,
    findPaginateAllMediaFor,
  };
}
