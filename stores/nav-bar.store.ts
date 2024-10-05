function minMax(value: number) {
  return Math.min(Math.max(value, 12), 30);
}

export const useNavBarStore = defineStore('nav-bar.store', {
  state: () => ({
    isFullClosed: false,
    isOpen: true,
    width: 15.4,
    openWidth: 15.4,
    closedWidth: 4.5,
  }),
  getters: {
    // navBarIsOpen: (state) => state.isOpen,
  },
  actions: {
    setOpen(value: boolean) {
      this.isOpen = value;
      this.resetWidth();
    },
    toggleFullClosed() {
      if (this.isOpen) this.setOpen(false);
      this.isFullClosed = !this.isFullClosed;
    },
    toggleOpen() {
      this.isOpen = !this.isOpen;
      this.resetWidth();
    },
    setWidth(e: MouseEvent) {
      e.stopImmediatePropagation();
      e.preventDefault();
      this.width = minMax(e.clientX / 16);
      this.openWidth = this.width;
    },
    resetWidth() {
      this.width = this.isOpen ? this.openWidth : this.closedWidth;
    },
  },
  persist: true,
});
