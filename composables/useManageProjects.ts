interface CreateProjectDto {
  name: string;
  description: string;
}

interface UpdateProjectDto {
  name: string;
  description: string;
}

export default function useManageProjects() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let projectId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setProjectId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    projectId = id;
  }

  function createProject(payload: CreateProjectDto) {
    return $client.project.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getProject(id: string | string[] | undefined | null) {
    setProjectId(id);
    return useAsyncData(async () => {
      const project = await $client.project.first.query(
        { id: projectId },
        {
          signal: ac.signal,
        },
      );
      return project;
    });
  }

  function getAllProjects() {
    return useAsyncData(async () => {
      const [projects, meta] = await $client.project.all.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { projects, meta };
    });
  }

  function updateProject(payload: UpdateProjectDto) {
    return $client.project.update.mutate(
      {
        projectId,
        ...payload,
      },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    setPage,
    setProjectId,
    createProject,
    getProject,
    getAllProjects,
    updateProject,
  };
}
