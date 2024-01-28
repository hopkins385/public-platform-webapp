export const useChatStore = defineStore('chatStore', {
  state: () => ({
    model: 'local',
  }),
  getters: {
    selectedModel: (state) => state.model,
  },
  actions: {
    setModel(model: string) {
      this.model = model;
    },
  },
});
