import { useEventListener } from '@vueuse/core';

export function useResizeSheet() {
  const sheetStore = useSheetStore();

  function setRowHeight(e: MouseEvent, rowId: number) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const rowCells = document.querySelectorAll(`[id^=row_${rowId}_cell]`) as NodeListOf<HTMLElement>;

    const row = document.getElementById(`row_${rowId}`) as HTMLElement;

    const newHeight = e.clientY - row.getBoundingClientRect().top;

    if (newHeight < 32) return;

    rowCells.forEach((cell) => {
      cell.style.height = `${newHeight}px`;
    });

    return newHeight;
  }

  function resizeRowListener(ev: MouseEvent, rowIndex: number, workflowId: string) {
    const mouseMoveEventListener = useEventListener('mousemove', (e) => {
      const newHeight = setRowHeight(e, rowIndex);
      sheetStore.updateOrCreateHeight(workflowId, rowIndex, newHeight);
    });

    addEventListener('mouseup', () => {
      mouseMoveEventListener(); // remove mousemove event listener
    });
  }

  function setColumWidth(e: MouseEvent, columnId: number) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const column = document.getElementById(`column_${columnId}`) as HTMLElement;
    // column.style.width = `${e.clientX - column.getBoundingClientRect().left}px`;

    const columnCells = document.querySelectorAll(`[id^="row_"][id$="cell_${columnId}"]`) as NodeListOf<HTMLElement>;

    const newWidth = e.clientX - column.getBoundingClientRect().left;

    if (newWidth < 160) return;

    columnCells.forEach((cell) => {
      cell.style.width = `${newWidth}px`;
    });

    return newWidth;
  }

  function resizeColumnListener(ev: MouseEvent, columnIndex: number, workflowId: string) {
    const mouseMoveEventListener = useEventListener('mousemove', (e) => {
      const newWidth = setColumWidth(e, columnIndex);
      sheetStore.updateOrCreateWidth(workflowId, columnIndex, newWidth);
    });

    addEventListener('mouseup', () => {
      mouseMoveEventListener(); // remove mousemove event listener
    });
  }

  function resizeAll(e: MouseEvent, workflowId: string) {
    const rows = document.querySelectorAll('[id^=row_]') as NodeListOf<HTMLElement>;
    const columns = document.querySelectorAll('[id^=column_]') as NodeListOf<HTMLElement>;

    rows.forEach((row) => {
      const rowId = row.id.split('_')[1];
      const rowCells = document.querySelectorAll(`[id^=row_${rowId}_cell]`) as NodeListOf<HTMLElement>;
      const newHeight = e.clientX - rowCells[0].getBoundingClientRect().height;
      row.style.height = `${newHeight}px`;
      // sheetStore.updateOrCreateHeight(rowId, newHeight);
      // apply new height to all cells in the row
      // rowCells.forEach((cell) => {
      //   cell.style.height = `${newHeight}px`;
      // });
    });

    columns.forEach((column) => {
      const columnId = column.id.split('_')[1];
      const columnCells = document.querySelectorAll(`[id^=row_][id$=cell_${columnId}]`) as NodeListOf<HTMLElement>;
      const newWidth = e.clientX - columnCells[0].getBoundingClientRect().width;
      // sheetStore.updateOrCreateWidth(columnId, newWidth);
      // apply new width to all cells in the column
      // columnCells.forEach((cell) => {
      //   cell.style.width = `${newWidth}px`;
      // });
    });
  }

  function resizeAllListener(ev: MouseEvent, workflowId: string) {
    const resAllListener = useEventListener('mousemove', (e) => {
      resizeAll(e, workflowId);
    });

    addEventListener('mouseup', () => {
      resAllListener(); // remove mousemove event listener
    });
  }

  function initRowHeights(rows: any[]) {
    rows.forEach((row) => {
      const rowCells = document.querySelectorAll(`[id^=row_${row.id}_cell]`) as NodeListOf<HTMLElement>;

      rowCells.forEach((cell) => {
        cell.style.height = `${row.height}px`;
      });
    });
  }

  function initColumnWidths(columns: any[]) {
    columns.forEach((column) => {
      const columnCells = document.querySelectorAll(`[id^=row_][id$=cell_${column.id}]`) as NodeListOf<HTMLElement>;

      columnCells.forEach((cell) => {
        cell.style.width = `${column.width}px`;
      });
    });
  }

  function initSheetDimensions(workflowId: string) {
    const sheet = sheetStore.dimensions.find((sheet) => sheet.workflowId === workflowId.toLowerCase());

    if (sheet) {
      initRowHeights(sheet.row);
      initColumnWidths(sheet.column);
    }
  }

  return {
    resizeRowListener,
    resizeColumnListener,
    resizeAllListener,
    initSheetDimensions,
  };
}
