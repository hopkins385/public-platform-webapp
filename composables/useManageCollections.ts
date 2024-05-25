import type { AsyncDataOptions } from '#app';

interface ICreateCollection {
  name: string;
  description?: string;
}

interface IUpdateCollection {
  name: string;
  description?: string;
}

export default function useManageCollections() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  const page = ref<number>(1);
  let collectionId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page.value = p;
  }

  function setCollectionId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    collectionId = id;
  }

  function createCollection(payload: ICreateCollection) {
    return $client.collection.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function updateCollection(id: string | string[] | undefined | null, payload: IUpdateCollection) {
    setCollectionId(id);
    return $client.collection.update.mutate(
      {
        id: collectionId,
        ...payload,
      },
      {
        signal: ac.signal,
      },
    );
  }

  function findFirst(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
    setCollectionId(id);
    return useAsyncData(
      `collection:${collectionId}`,
      async () => {
        return await $client.collection.findFirst.query(
          { id: collectionId },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  function findAll(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      'allCollections',
      async () => {
        return await $client.collection.findAll.query(undefined, {
          signal: ac.signal,
        });
      },
      options,
    );
  }

  function findAllPaginated(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      'allCollectionsPaginated',
      async () => {
        const [collections, meta] = await $client.collection.findAllPaginated.query(
          { page: page.value },
          {
            signal: ac.signal,
          },
        );
        return { collections, meta };
      },
      {
        watch: [page],
        ...options,
      },
    );
  }

  function findAllFor(
    model: {
      id: string;
      type: any;
    },
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(
      `allCollectionsFor:${JSON.stringify(model)}`,
      async () => {
        return await $client.collection.findAllFor.query(
          { model },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  function deleteCollection(id: string) {
    setCollectionId(id);
    return $client.collection.delete.mutate(
      { id: collectionId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    page,
    setPage,
    setCollectionId,
    createCollection,
    findAll,
    findAllPaginated,
    findAllFor,
    findFirst,
    deleteCollection,
    updateCollection,
  };
}
