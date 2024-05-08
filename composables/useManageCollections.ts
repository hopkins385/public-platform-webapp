import { set } from 'zod';

interface ICreateCollection {
  name: string;
  description?: string;
}

export default function useManageCollections() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let collectionId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
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

  function findFirst(id: string | string[] | undefined | null) {
    setCollectionId(id);
    return useAsyncData(`collection:${collectionId}`, async () => {
      return await $client.collection.findFirst.query(
        { id: collectionId },
        {
          signal: ac.signal,
        },
      );
    });
  }

  function findAll() {
    return useAsyncData('allCollections', async () => {
      return await $client.collection.findAll.query(undefined, {
        signal: ac.signal,
      });
    });
  }

  function findAllPaginated() {
    return useAsyncData('allCollectionsPaginated', async () => {
      const [collections, meta] =
        await $client.collection.findAllPaginated.query(
          { page },
          {
            signal: ac.signal,
          },
        );
      return { collections, meta };
    });
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
    setPage,
    setCollectionId,
    createCollection,
    findAll,
    findAllPaginated,
    findFirst,
    deleteCollection,
  };
}
