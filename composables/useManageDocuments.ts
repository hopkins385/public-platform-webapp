interface IDocumentPayload {
  //
}

export default function useManageDocuments() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let documentId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setDocumentId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    documentId = id;
  }

  function createDocument(payload: IDocumentPayload) {
    return $client.document.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getAllDocuments(projectId: string | string[] | undefined | null) {
    return useAsyncData(async () => {
      const [documents, meta] = await $client.document.findAll.query(
        {
          projectId: projectId as string,
          page,
        },
        {
          signal: ac.signal,
        },
      );
      return { documents, meta };
    });
  }

  function getDocument(documentId: string) {
    setDocumentId(documentId);
    return useAsyncData(async () => {
      if (!documentId) return;
      const document = await $client.document.find.query(
        { documentId },
        {
          signal: ac.signal,
        },
      );
      return document;
    });
  }

  function updateDocument(payload: IDocumentPayload) {
    return $client.document.update.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteDocument(documentId: string) {
    return $client.document.delete.query(
      { documentId },
      {
        signal: ac.signal,
      },
    );
  }

  function parseDocument(id: string | string[] | undefined | null) {
    setDocumentId(id);
    return useAsyncData(async () => {
      const result = await $client.document.parse.query(
        { documentId },
        {
          signal: ac.signal,
        },
      );
      return result;
    });
  }

  return {
    setPage,
    setDocumentId,
    createDocument,
    getAllDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    parseDocument,
  };
}
