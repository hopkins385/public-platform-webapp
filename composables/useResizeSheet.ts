import { useEventListener } from '@vueuse/core';

export function useResizeSheet() {
  const sheetStore = useSheetStore();

  function setRowHeight(e: MouseEvent, rowId: number) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const rowCells = document.querySelectorAll(
      `[id^=row_${rowId}_cell]`,
    ) as NodeListOf<HTMLElement>;

    const row = document.getElementById(`row_${rowId}`) as HTMLElement;

    const newHeight = e.clientY - row.getBoundingClientRect().top;

    rowCells.forEach((cell) => {
      cell.style.height = `${newHeight}px`;
    });

    return newHeight;
  }

  function resizeRowListener(
    ev: MouseEvent,
    rowIndex: number,
    workflowId: string,
  ) {
    console.log('resize row listener');
    const mouseMoveEventListener = useEventListener('mousemove', (e) => {
      const newHeight = setRowHeight(e, rowIndex);
      sheetStore.updateOrCreateHeight(workflowId, newHeight);
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

    const columnCells = document.querySelectorAll(
      `[id^="row_"][id$="cell_${columnId}"]`,
    ) as NodeListOf<HTMLElement>;

    const newWidth = e.clientX - column.getBoundingClientRect().left;

    columnCells.forEach((cell) => {
      cell.style.width = `${newWidth}px`;
    });

    return newWidth;
  }

  function resizeColumnListener(
    ev: MouseEvent,
    columnIndex: number,
    workflowId: string,
  ) {
    console.log('resize column listener');
    const mouseMoveEventListener = useEventListener('mousemove', (e) => {
      const newWidth = setColumWidth(e, columnIndex);
      sheetStore.updateOrCreateWidth(workflowId, newWidth);
    });

    addEventListener('mouseup', () => {
      mouseMoveEventListener(); // remove mousemove event listener
    });
  }

  return { resizeRowListener, resizeColumnListener };
}
