export const useChatStore = defineStore('chatStore', {
  state: () => ({
    model: 'open-mixtral-8x7b',
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
