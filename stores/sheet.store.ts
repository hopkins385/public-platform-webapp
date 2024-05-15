interface SheetDimension {
  workflowId: string;
  column: [
    {
      id: number;
      width: number;
    },
  ];
  row: [
    {
      id: number;
      height: number;
    },
  ];
}

export const useSheetStore = defineStore('sheet.store', {
  state: () => ({
    dimensions: [] as SheetDimension[],
  }),
  actions: {
    updateOrCreateHeight(
      workflowId: string,
      rowIndex: number,
      newHeight: number,
    ) {
      const sheet = this.dimensions.find(
        (sheet) => sheet.workflowId === workflowId,
      );
      if (sheet) {
        const row = sheet.row.find((row) => row.id === rowIndex);
        if (row) {
          row.height = newHeight;
        } else {
          sheet.row.push({ id: rowIndex, height: newHeight });
        }
      } else {
        this.dimensions.push({
          workflowId,
          column: [],
          row: [{ id: rowIndex, height: newHeight }],
        });
      }
    },
    updateOrCreateWidth(
      workflowId: string,
      columnIndex: number,
      newWidth: number,
    ) {
      const sheet = this.dimensions.find(
        (sheet) => sheet.workflowId === workflowId,
      );
      if (sheet) {
        const column = sheet.column.find((column) => column.id === columnIndex);
        if (column) {
          column.width = newWidth;
        } else {
          sheet.column.push({ id: columnIndex, width: newWidth });
        }
      } else {
        this.dimensions.push({
          workflowId,
          column: [{ id: columnIndex, width: newWidth }],
          row: [],
        });
      }
    },
  },
  persist: true,
});
