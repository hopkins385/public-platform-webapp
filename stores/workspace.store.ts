export const useWorkspaceStore = defineStore('project.store', {
  state: () => ({
    activeProjectId: '',
  }),
  getters: {},
  actions: {
    setActiveProjectId(projectId: string) {
      this.activeProjectId = projectId;
    },
  },
  persist: true,
});
