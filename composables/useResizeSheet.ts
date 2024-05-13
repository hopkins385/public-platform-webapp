import { useEventListener } from '@vueuse/core';

export function useResizeSheet() {
  function setRowHeight(e: MouseEvent, rowId: number) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const rowCells = document.querySelectorAll(
      `[id^=row_${rowId}_cell]`,
    ) as NodeListOf<HTMLElement>;

    const row = document.getElementById(`row_${rowId}`) as HTMLElement;

    rowCells.forEach((cell) => {
      cell.style.height = `${e.clientY - row.getBoundingClientRect().top}px`;
    });
  }

  function resizeRowListener(ev: MouseEvent, rowIndex: number) {
    console.log('resize row listener');
    const mouseMoveEventListener = useEventListener('mousemove', (e) =>
      setRowHeight(e, rowIndex),
    );

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

    columnCells.forEach((cell) => {
      cell.style.width = `${e.clientX - column.getBoundingClientRect().left}px`;
    });
  }

  function resizeColumnListener(ev: MouseEvent, columnIndex: number) {
    console.log('resize column listener');
    const mouseMoveEventListener = useEventListener('mousemove', (e) =>
      setColumWidth(e, columnIndex),
    );

    addEventListener('mouseup', () => {
      mouseMoveEventListener(); // remove mousemove event listener
    });
  }

  return { resizeRowListener, resizeColumnListener };
}
