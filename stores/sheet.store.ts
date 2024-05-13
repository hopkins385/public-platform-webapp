interface SheetDimension {
  workflowId: string;
  columnWidth: number;
  rowHeight: number;
}

export const useSheetStore = defineStore('sheet.store', {
  state: () => ({
    dimensions: [] as SheetDimension[],
  }),
  actions: {
    addSheetDimension(
      workflowId: string,
      columnWidth: number,
      rowHeight: number,
    ) {
      this.dimensions.push({ workflowId, columnWidth, rowHeight });
    },
    removeSheetDimension(workflowId: string) {
      this.dimensions = this.dimensions.filter(
        (d) => d.workflowId !== workflowId,
      );
    },
    updateSheetDimension(
      workflowId: string,
      columnWidth: number,
      rowHeight: number,
    ) {
      const index = this.dimensions.findIndex(
        (d) => d.workflowId === workflowId,
      );
      if (index !== -1) {
        this.dimensions[index] = { workflowId, columnWidth, rowHeight };
      }
    },
    getSheetDimension(workflowId: string) {
      return this.dimensions.find((d) => d.workflowId === workflowId);
    },
    updateWidth(workflowId: string, columnWidth: number) {
      const index = this.dimensions.findIndex(
        (d) => d.workflowId === workflowId,
      );
      if (index !== -1) {
        this.dimensions[index].columnWidth = columnWidth;
      }
    },
    updateHeight(workflowId: string, rowHeight: number) {
      const index = this.dimensions.findIndex(
        (d) => d.workflowId === workflowId,
      );
      if (index !== -1) {
        this.dimensions[index].rowHeight = rowHeight;
      }
    },
    updateOrCreateWidth(workflowId: string, columnWidth: number) {
      const index = this.dimensions.findIndex(
        (d) => d.workflowId === workflowId,
      );
      if (index !== -1) {
        this.dimensions[index].columnWidth = columnWidth;
      } else {
        this.dimensions.push({ workflowId, columnWidth, rowHeight: 0 });
      }
    },
    updateOrCreateHeight(workflowId: string, rowHeight: number) {
      const index = this.dimensions.findIndex(
        (d) => d.workflowId === workflowId,
      );
      if (index !== -1) {
        this.dimensions[index].rowHeight = rowHeight;
      } else {
        this.dimensions.push({ workflowId, columnWidth: 0, rowHeight });
      }
    },
  },
  persist: true,
});
