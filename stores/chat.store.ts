export const useChatStore = defineStore('chatStore', {
  state: () => ({
    modelWithVision: false,
    model: '',
    provider: '',
  }),
  getters: {
    selectedModel: (state) => state.model,
  },
  actions: {
    setOnlyModel(model: string, hasVision: boolean) {
      this.modelWithVision = hasVision || false;
      this.model = model;
    },
    setOnlyProvider(provider: string) {
      this.provider = provider;
    },
    setModel(payload: { model: string; provider: string; hasVision: boolean }) {
      this.model = payload.model;
      this.provider = payload.provider;
      this.modelWithVision = payload.hasVision || false;
    },
  },
});
