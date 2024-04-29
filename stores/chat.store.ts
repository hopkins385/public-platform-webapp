export const useChatStore = defineStore('chatStore', {
  state: () => ({
    model: 'claude-3-opus-20240229',
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
