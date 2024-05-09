import { defineStore } from 'pinia';

interface IChatSettings {
  temperature: [number];
  presencePenalty: [number];
  maxTokens: [number];
  submitOnEnter: boolean;
}

export const useChatSettingsStore = defineStore('chat-settings', {
  state: (): IChatSettings => ({
    temperature: [80],
    presencePenalty: [0],
    maxTokens: [1500],
    submitOnEnter: false,
  }),
  getters: {
    getTemperature(state) {
      return state.temperature[0] / 100;
    },
    getPresencePenalty(state) {
      return state.presencePenalty[0] / 100;
    },
    getMaxTokens(state) {
      return state.maxTokens[0];
    },
  },
  actions: {
    setTemperature(temperature: [number]) {
      this.temperature = temperature;
    },
    setPresencePenalty(presencePenalty: [number]) {
      this.presencePenalty = presencePenalty;
    },
    setMaxTokens(maxTokens: [number]) {
      this.maxTokens = maxTokens;
    },
    resetSettings() {
      this.temperature = [80];
      this.presencePenalty = [0];
      this.maxTokens = [1500];
    },
  },
  persist: true,
});
