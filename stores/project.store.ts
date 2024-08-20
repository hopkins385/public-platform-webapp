export const useProjectStore = defineStore('project.store', {
  state: () => ({
    activeProjectId: '',
  }),
  getters: {
    getActiveProjectId: (state) => {
      return state.activeProjectId;
    },
  },
  actions: {
    setActiveProjectId(projectId: string) {
      this.activeProjectId = projectId;
    },
  },
  persist: true,
});
