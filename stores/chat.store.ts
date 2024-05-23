export const useChatStore = defineStore('chatStore', {
  state: () => ({
    model: 'gpt-4o',
    provider: 'openai',
  }),
  getters: {
    selectedModel: (state) => state.model,
  },
  actions: {
    setModel(model: string) {
      this.model = model;
    },
    setProvider(provider: string) {
      this.provider = provider;
    },
    setModelAndProvider(model: string, provider: string) {
      this.model = model;
      this.provider = provider;
    },
  },
});
