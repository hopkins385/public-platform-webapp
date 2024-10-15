interface ImgGenSettings {
  imageCount: number[];
  imageWidth: number[];
  imageHeight: number[];
  imageGuidance: number[];
  promptUpsampling: boolean;
  submitOnEnter: boolean;
  showHidden: boolean;
}

export const useImgGenSettingsStore = defineStore('img-gen.store', {
  state: (): ImgGenSettings => ({
    imageCount: [4],
    imageWidth: [1024],
    imageHeight: [1024],
    imageGuidance: [2.5],
    promptUpsampling: false,
    submitOnEnter: false,
    showHidden: false,
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
    getSubmitOnEnter(state) {
      return state.submitOnEnter;
    },
    getShowHidden(state) {
      return state.showHidden;
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
    setPromptUpsampling(promptUpsampling: boolean) {
      this.promptUpsampling = Boolean(promptUpsampling);
    },
    setSubmitOnEnter(submitOnEnter: boolean) {
      this.submitOnEnter = Boolean(submitOnEnter);
    },
    setShowHidden(showHidden: boolean) {
      this.showHidden = Boolean(showHidden);
    },
    togglePromptUpsampling() {
      this.promptUpsampling = !this.promptUpsampling;
    },
    toggleSubmitOnEnter() {
      this.submitOnEnter = !this.submitOnEnter;
    },
    toggleShowHidden() {
      this.showHidden = !this.showHidden;
    },
    resetSettings() {
      this.imageCount = [4];
      this.imageWidth = [1024];
      this.imageHeight = [1024];
      this.imageGuidance = [2.5];
      this.promptUpsampling = false;
      this.submitOnEnter = false;
      this.showHidden = false;
    },
  },
  persist: true,
});
