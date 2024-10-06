interface ImgGenSettings {
  imageCount: number[];
  imageWidth: number[];
  imageHeight: number[];
  imageGuidance: number[];
  promptUpsampling: boolean;
  submitOnEnter: boolean;
}

export const useImgGenSettingsStore = defineStore('img-gen.store', {
  state: (): ImgGenSettings => ({
    imageCount: [4],
    imageWidth: [1024],
    imageHeight: [1024],
    imageGuidance: [2.5],
    promptUpsampling: false,
    submitOnEnter: false,
  }),
  getters: {
    getImageCount(state) {
      return state.imageCount[0];
    },
    getImageWidth(state) {
      // images size must be a multiple of 32
      return Math.floor(state.imageWidth[0] / 32) * 32;
    },
    getImageHeight(state) {
      // images size must be a multiple of 32
      return Math.floor(state.imageHeight[0] / 32) * 32;
    },
    getImageGuidance(state) {
      return state.imageGuidance[0];
    },
    getPromptUpsampling(state) {
      return state.promptUpsampling;
    },
  },
  actions: {
    setImageCount(imageCount: number[]) {
      this.imageCount = imageCount;
    },
    setImageWidth(imageWidth: number[]) {
      this.imageWidth = imageWidth;
    },
    setImageHeight(imageHeight: number[]) {
      this.imageHeight = imageHeight;
    },
    togglePromptUpsampling() {
      this.promptUpsampling = !this.promptUpsampling;
    },
    toggleSubmitOnEnter() {
      this.submitOnEnter = !this.submitOnEnter;
    },
    resetSettings() {
      this.imageCount = [4];
      this.imageWidth = [1024];
      this.imageHeight = [1024];
      this.imageGuidance = [2.5];
      this.promptUpsampling = false;
    },
  },
  persist: true,
});
