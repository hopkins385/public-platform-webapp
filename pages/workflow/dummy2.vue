<script setup lang="ts">
  import { useEventListener } from '@vueuse/core';
  import { Table2Icon } from 'lucide-vue-next';

  function setRowHeight(e: MouseEvent, rowId: number) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const row = document.getElementById(`row_${rowId}`) as HTMLElement;
    row.style.height = `${e.clientY - row.getBoundingClientRect().top}px`;
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
</script>

<template>
  <div class="h-full">
    <div class="flex h-14 items-center border-b px-4 text-sm">
      <span class="opacity-50">All Projects</span>
    </div>
    <div class="flex h-14 items-center border-b px-4 text-sm">
      <div
        class="flex w-fit rounded-lg border bg-white px-3 py-2 text-xs shadow-md"
      >
        <Table2Icon class="mr-1 size-4 stroke-1.5" />
        <span class="font-bold">Main</span>
      </div>
    </div>
    <div class="flex bg-white text-xs" id="grid_list">
      <table>
        <tr id="row_0">
          <th @mousedown="resizeRowListener($event, 0)">Head</th>
          <th>Head</th>
          <th>Head</th>
          <th>Head</th>
          <th>Head</th>
        </tr>
        <tr id="row_1">
          <td @mousedown="resizeRowListener($event, 1)">H1</td>
          <td>
            <div>
              Minim occaecat adipisicing consectetur magna ea officia. Ipsum id
              consequat magna cillum anim eiusmod commodo. Velit laboris dolor
              sunt deserunt irure in. Esse labore id esse non elit sint quis
              fugiat exercitation. Lorem veniam reprehenderit nulla. Consectetur
              duis sunt dolore consequat commodo duis. Do sunt sint pariatur
              reprehenderit ex.
            </div>
          </td>
          <td>
            <div>
              Minim occaecat adipisicing consectetur magna ea officia. Ipsum id
              consequat magna cillum anim eiusmod commodo. Velit laboris dolor
              sunt deserunt irure in. Esse labore id esse non elit sint quis
              fugiat exercitation. Lorem veniam reprehenderit nulla. Consectetur
              duis sunt dolore consequat commodo duis. Do sunt sint pariatur
              reprehenderit ex.
            </div>
          </td>
          <td>
            <div>
              Minim occaecat adipisicing consectetur magna ea officia. Ipsum id
              consequat magna cillum anim eiusmod commodo. Velit laboris dolor
              sunt deserunt irure in. Esse labore id esse non elit sint quis
              fugiat exercitation. Lorem veniam reprehenderit nulla. Consectetur
              duis sunt dolore consequat commodo duis. Do sunt sint pariatur
              reprehenderit ex.
            </div>
          </td>
          <td>
            <div>
              Minim occaecat adipisicing consectetur magna ea officia. Ipsum id
              consequat magna cillum anim eiusmod commodo. Velit laboris dolor
              sunt deserunt irure in. Esse labore id esse non elit sint quis
              fugiat exercitation. Lorem veniam reprehenderit nulla. Consectetur
              duis sunt dolore consequat commodo duis. Do sunt sint pariatur
              reprehenderit ex.
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
  td,
  th {
    @apply border;
  }

  td > div {
    @apply h-8 w-20 overflow-hidden border p-0;
  }
</style>
