export interface IDocumentItemPayload {
  documentId: string;
  orderColumn: number;
  status: string;
  type: string;
  content: string;
}

export default function useManageDocumentItems() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let documentItemId: string = '';
  let documentId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setDocumentItemId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    documentItemId = id;
  }

  function setDocumentId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    documentId = id;
  }

  function createDocumentItem(payload: IDocumentItemPayload) {
    return $client.documentItem.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function createManyDocumentItems(payload: IDocumentItemPayload[]) {
    return $client.documentItem.createMany.mutate(payload, {
      signal: ac.signal,
    });
  }

  function getDocumentItem(documentItemId: string) {
    setDocumentItemId(documentItemId);
    return useAsyncData(`documentItem:${documentItemId}`, async () => {
      if (!documentItemId) return;
      const documentItem = await $client.documentItem.find.query(
        { documentItemId },
        {
          signal: ac.signal,
        },
      );
      return documentItem;
    });
  }

  function getDocumentItems(documentId: string) {
    setDocumentId(documentId);
    return useAsyncData(`documentItems:${documentId}`, async () => {
      if (!documentId) return;
      const documentItems = await $client.documentItem.findMany.query(
        { documentId },
        {
          signal: ac.signal,
        },
      );
      return documentItems;
    });
  }

  function updateDocumentItem(payload: IDocumentItemPayload) {
    return $client.documentItem.update.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteDocumentItem(documentItemId: string) {
    return $client.documentItem.delete.query(
      { documentItemId },
      {
        signal: ac.signal,
      },
    );
  }

  function updateManyDocumentItems(payload: IDocumentItemPayload[]) {
    return $client.documentItem.updateMany.mutate(payload, {
      signal: ac.signal,
    });
  }

  return {
    setDocumentItemId,
    setDocumentId,
    createDocumentItem,
    createManyDocumentItems,
    getDocumentItem,
    getDocumentItems,
    updateDocumentItem,
    deleteDocumentItem,
    updateManyDocumentItems,
  };
}
