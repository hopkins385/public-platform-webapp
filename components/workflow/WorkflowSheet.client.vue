<script setup lang="ts">
  import { AlignLeftIcon } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
  }>();

  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflowData,
    refresh,
    error,
  } = await getFullWorkflow(props.workflowId);

  const steps = computed(() => workflowData.value.steps);

  const rowCount = computed(
    () => steps.value[0]?.document.documentItems.length || 0,
  );

  const { resizeRowListener, resizeColumnListener } = useResizeSheet();

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(props.workflowId);
  }
</script>

<template>
  <!-- Sheet-->
  <div class="flex bg-white text-xs" id="grid_list">
    <!-- Row Index -->
    <div class="column" id="column_0">
      <div class="index" id="row_0_cell_x0_y1"></div>
      <div
        v-for="(count, index) in rowCount"
        :key="index"
        :id="`row_${index + 1}`"
        class="relative"
      >
        <div
          class="index flex flex-col items-center justify-between"
          :id="`row_${index + 1}_cell_x0_y${index + 1}`"
        >
          <div class="">{{ index + 1 }}</div>
          <!-- Resize Row -->
          <div class="group w-full px-2" style="padding-bottom: 0.1rem">
            <div
              class="h-1 w-full shrink-0 cursor-ns-resize rounded-lg hover:bg-slate-400 group-hover:bg-slate-200"
              @mousedown="resizeRowListener($event, index + 1)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- WorkflowSteps as Columns -->
    <div
      v-for="(step, columnIndex) in steps"
      :key="columnIndex"
      :id="`column_${columnIndex}`"
      class="column"
    >
      <!-- Column Heading -->
      <div
        class="cell group flex items-center justify-between px-2 py-1 hover:bg-slate-100"
        :id="`row_0_cell_${columnIndex}`"
      >
        <!-- Heading Icon -->
        <div class="flex">
          <AlignLeftIcon class="mr-2 size-4 stroke-1.5" />
          {{ step.name }}
        </div>
        <!-- Resize Column -->
        <div class="-mr-1 h-full opacity-0 group-hover:opacity-100">
          <div
            class="h-full w-1 shrink-0 cursor-ew-resize rounded-lg bg-slate-300 hover:bg-slate-400"
            @mousedown="resizeColumnListener($event, columnIndex)"
          ></div>
        </div>
      </div>
      <!-- DocumentItems as Rows -->
      <div
        v-for="(docItem, rowIndex) in step.document.documentItems"
        :id="`row_${rowIndex + 1}_cell_${columnIndex}`"
        class="cell"
      >
        <div class="">
          {{ docItem.content }}
        </div>
      </div>
    </div>
  </div>
  <!-- pre>
    {{ workflowData }}
  </!-->
</template>

<style>
  .column {
    @apply grid w-fit border-0;
  }
  .index {
    @apply h-8 w-10 border-b border-l;
  }
  .cell {
    @apply h-8 w-52 overflow-hidden break-words border-b border-l p-2;
  }

  .cell-content {
    @apply h-full w-full overflow-hidden text-ellipsis break-words;
  }
</style>
