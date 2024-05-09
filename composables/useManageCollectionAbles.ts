interface IModelAble {
  id: string;
  type: any;
}

export default function useManageCollectionAbles() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;

  onScopeDispose(() => {
    ac.abort();
  });

  async function attachCollectionTo(model: IModelAble, collectionId: string) {
    if (!model.id || !model.type || !collectionId) return;
    return await $client.collectionAble.attachTo.mutate(
      {
        model,
        collectionId,
      },
      {
        signal: ac.signal,
      },
    );
  }

  async function detachCollectionFrom(model: IModelAble, collectionId: string) {
    if (!model.id || !model.type || !collectionId) return;
    return await $client.collectionAble.detachFrom.mutate(
      {
        model,
        collectionId,
      },
      {
        signal: ac.signal,
      },
    );
  }

  async function replaceCollectionTo(model: IModelAble, collectionId: string) {
    if (!model.id || !model.type || !collectionId) return;
    return await $client.collectionAble.replaceTo.mutate(
      {
        model,
        collectionId,
      },
      {
        signal: ac.signal,
      },
    );
  }

  async function detachAllCollectionsFor(model: IModelAble) {
    if (!model.id || !model.type) return;
    return await $client.collectionAble.detachAllFrom.mutate(
      {
        model,
      },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    attachCollectionTo,
    detachCollectionFrom,
    replaceCollectionTo,
    detachAllCollectionsFor,
  };
}
