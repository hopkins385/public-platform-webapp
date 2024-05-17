export const useChatStore = defineStore('chatStore', {
  state: () => ({
    model: 'gpt-4o',
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
