<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import { AlignLeftIcon, PlusIcon, LayoutDashboard, LoaderIcon, TriangleAlertIcon, Trash2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
    projectId: string;
  }>();

  const sideBarOpen = ref(false);
  const sheetRef = ref<HTMLElement | null>(null);

  const socket = useWebsocketGlobal();

  const stepCard = reactive({
    show: false,
    teleportTo: 0,
    workflowStepId: '',
  });

  const cellCard = reactive({
    show: false,
    teleportTo: {
      x: 0,
      y: 0,
    },
    contentId: '',
    content: '',
  });

  const { resizeRowListener, resizeColumnListener, initSheetDimensions } = useResizeSheet();
  const { createWorkflowStep, updateInputSteps } = useManageWorkflowSteps();
  const { createManyDocumentItems } = useManageDocumentItems();

  const { getFullWorkflow, deleteWorkflowRows } = useManageWorkflows();
  const { data: workflowData, refresh, error } = await getFullWorkflow(props.workflowId);

  const steps = computed(() => workflowData.value?.steps || []);
  const rowCount = computed(() => steps.value[0]?.document.documentItems.length || 0);
  const columnCount = computed(() => steps.value.length);

  const workflowStepCardActive = computed(() => {
    return steps.value.find((step: any) => step.id === stepCard.workflowStepId);
  });

  async function onAddWorkflowStep() {
    const assistant = workflowData.value?.steps[0]?.assistant;
    if (!assistant || !assistant?.id) {
      console.error('No assistant found');
      return;
    }
    await createWorkflowStep({
      workflowId: props.workflowId,
      projectId: workflowData.value.project.id,
      assistantId: assistant.id,
      name: 'New Step',
      description: 'New Step Description',
      orderColumn: columnCount.value,
      rowCount: rowCount.value,
    });

    await refresh();
    initSheetDimensions(props.workflowId);
  }

  async function onAddWorkflowRow() {
    const documentItems = workflowData.value.steps.map((step: any) => {
      return {
        documentId: step.document.id,
        orderColumn: step.document.documentItems.length,
        content: '',
        status: 'draft',
        type: 'text',
      };
    });
    await createManyDocumentItems(documentItems);
    await refresh();
    initSheetDimensions(props.workflowId);
  }

  function toggleStepCard(id: number, stepId: string) {
    // only if click again on the same step, close the card if it is open
    if (stepCard.show && stepCard.teleportTo === id) {
      stepCard.show = false;
      return;
    }
    stepCard.teleportTo = id;
    stepCard.workflowStepId = stepId;
    stepCard.show = true;
  }

  function onCloseStepCard() {
    stepCard.show = false;
    stepCard.teleportTo = 0;
    stepCard.workflowStepId = '';
  }

  function toggleCellCard(x: number, y: number, content: string, id: string) {
    // if click again on the same item, ignore
    if (cellCard.show && cellCard.teleportTo.x === x && cellCard.teleportTo.y === y) {
      return;
    }
    cellCard.teleportTo.x = Number(x);
    cellCard.teleportTo.y = Number(y);
    cellCard.content = content;
    cellCard.contentId = id;
    cellCard.show = true;
  }

  function onCloseCellCard() {
    cellCard.show = false;
    cellCard.teleportTo = { x: 0, y: 0 };
    cellCard.contentId = '';
    cellCard.content = '';
  }

  async function onInputStepsUpdated(payload: { inputSteps: string[]; stepId: string }) {
    await updateInputSteps(payload.stepId, payload.inputSteps);
    await refresh();
  }

  function workflowUpdateListener(message: any) {
    console.log('workflow channel message', message);
    refresh();
  }

  const selectedRows = ref<number[]>([]);
  const hasSelectedRows = computed(() => selectedRows.value.length > 0);
  function onRowSelected(rowIndex: number) {
    if (selectedRows.value.includes(rowIndex)) {
      selectedRows.value = selectedRows.value.filter((row) => row !== rowIndex);
    } else {
      // push and sort
      selectedRows.value = [...selectedRows.value, rowIndex].sort((a, b) => a - b);
    }
  }

  function onAllRowsSelected() {
    selectedRows.value = Array.from({ length: rowCount.value }, (_, i) => i);
  }

  async function onDeleteSelectedRows() {
    console.log('delete selected rows', selectedRows.value);
    await deleteWorkflowRows(props.workflowId, selectedRows.value);
    deselectAllRows();
    await refresh();
  }

  function deselectAllRows() {
    selectedRows.value = [];
  }

  function onNoRowsSelected() {
    deselectAllRows();
  }

  function toggleAllRowsSelected() {
    if (hasSelectedRows.value) {
      onNoRowsSelected();
    } else {
      onAllRowsSelected();
    }
  }

  onMounted(() => {
    initSheetDimensions(props.workflowId);
    socket.on(`workflow-${props.workflowId}-update`, workflowUpdateListener);
  });

  onBeforeUnmount(() => {
    socket.off(`workflow-${props.workflowId}-update`, workflowUpdateListener);
  });
</script>

<template>
  <!-- Sheet-->
  <div class="p-4 text-sm" v-if="error || !workflowData">
    Ups something went wrong.<br />The Data you are looking for is not available.
  </div>
  <div id="workflowSheet" ref="sheetRef" class="no-scrollbar flex overflow-visible bg-white pb-10 text-xs">
    <!-- Row Index -->
    <div class="column" id="column_0">
      <div class="index relative flex items-center justify-center" id="row_0_cell_x0_y1">
        <Checkbox
          :checked="hasSelectedRows"
          @update:checked="toggleAllRowsSelected"
          class="size-3.5 border-stone-500"
        />
      </div>
      <div v-for="(count, rowIndex) in rowCount" :key="rowIndex" :id="`row_${rowIndex + 1}`" class="relative">
        <div
          class="index group flex flex-col items-center justify-between"
          :id="`row_${rowIndex + 1}_cell_x0_y${rowIndex + 1}`"
        >
          <div class="flex h-full items-center justify-center opacity-60">
            <div
              class="pt-2 group-hover:hidden"
              :class="{
                hidden: selectedRows.includes(rowIndex),
              }"
            >
              {{ rowIndex + 1 }}
            </div>
            <div
              class="group-hover:block"
              :class="{
                block: selectedRows.includes(rowIndex),
                hidden: !selectedRows.includes(rowIndex),
              }"
            >
              <Checkbox
                :checked="selectedRows.includes(rowIndex)"
                @update:checked="() => onRowSelected(rowIndex)"
                class="mt-2 size-3.5"
              />
            </div>
          </div>
          <!-- Resize Row -->
          <div
            class="group/icon flex h-3 w-full cursor-ns-resize items-center px-2"
            @mousedown="(event) => resizeRowListener(event, rowIndex + 1, workflowId)"
          >
            <div class="h-1 w-full shrink-0 rounded-lg group-hover/icon:bg-slate-400 group-hover:bg-slate-200"></div>
          </div>
        </div>
      </div>
      <!-- Add new Row -->
      <div class="index index-last plus-button" id="" @click="onAddWorkflowRow">
        <PlusIcon class="size-3 stroke-1.5" />
      </div>
    </div>
    <!-- WorkflowSteps as Columns -->
    <div v-for="(step, columnIndex) in steps" :key="columnIndex" :id="`column_${columnIndex}`" class="column relative">
      <!-- Teleport Anker -->
      <div class="absolute left-0 top-8 z-20 overflow-visible" :id="`step_teleport_anker_${columnIndex}`"></div>
      <!-- Heading Column -->
      <div
        :id="`row_0_cell_${columnIndex}`"
        class="cell group flex items-center justify-between px-2 py-1 hover:bg-slate-100"
      >
        <!-- Heading Text -->
        <div
          class="flex w-full cursor-pointer overflow-hidden"
          @click.stop="() => toggleStepCard(columnIndex, step.id)"
        >
          <AlignLeftIcon class="mr-2 size-4 shrink-0 stroke-1.5" />
          <span class="truncate">{{ step.name }}</span>
        </div>
        <!-- Resize Column -->
        <div class="-mr-1 h-full opacity-0 group-hover:opacity-100">
          <div
            class="h-full w-1 shrink-0 cursor-ew-resize rounded-lg bg-slate-300 hover:bg-slate-400"
            @mousedown="(event) => resizeColumnListener(event, columnIndex, workflowId)"
          ></div>
        </div>
      </div>
      <!-- DocumentItems as Rows -->
      <div
        v-for="(docItem, rowIndex) in step.document.documentItems"
        :id="`row_${rowIndex + 1}_cell_${columnIndex}`"
        :key="rowIndex"
        @click="() => toggleCellCard(columnIndex, rowIndex + 1, docItem.content, docItem.id)"
        class="cell group relative"
      >
        <!-- Cell State -->
        <div
          v-if="docItem.processingStatus && docItem.processingStatus !== 'completed'"
          class="absolute right-1 top-0 z-10 rounded-lg border shadow-sm"
        >
          <div v-if="docItem.processingStatus === 'failed'" class="rounded-lg bg-red-50 p-2 font-bold text-destructive">
            <TriangleAlertIcon class="size-3 stroke-1.5" />
          </div>
          <div v-if="docItem.processingStatus === 'pending'" class="rounded-lg bg-white p-2">
            <LoaderIcon class="size-3 animate-spin stroke-1.5" />
          </div>
        </div>
        <!-- Cell content -->
        <div :id="`cell_content_${docItem.id}`" class="cell-content">
          {{ docItem.content }}
        </div>
        <!-- Row Detail Link -->
        <div
          v-if="columnIndex === 0"
          class="group/link absolute right-1 top-1 z-10 opacity-0 group-hover:opacity-100"
          @click="(e) => e.stopPropagation()"
        >
          <NuxtLinkLocale
            :to="`/workflows/${workflowData.id}/detail?row=${rowIndex}`"
            class="flex items-center justify-center rounded-lg border bg-white p-1 shadow-md group-hover/link:bg-slate-100"
          >
            <LayoutDashboard class="size-3 stroke-1" />
          </NuxtLinkLocale>
        </div>
        <!-- Cellcard teleport anker -->
        <div class="absolute left-0 top-0 z-20" :id="`cellcard_teleport_anker_x${columnIndex}_y${rowIndex + 1}`"></div>
      </div>
      <!-- Last Cells -->
      <div class="cell cell-last"></div>
    </div>
    <!-- Last Column -->
    <div class="column" id="column_last">
      <!-- Add Column -->
      <div class="index plus-button" @click="onAddWorkflowStep">
        <PlusIcon class="size-3 stroke-1.5" />
      </div>
      <div v-for="(count, index) in rowCount" :key="index" :id="`row_${index + 1}_cell_last`" class="index"></div>
      <div class="index index-last">
        <!-- div @mousedown="(e) => resizeAllListener(e, workflowId)">h</!-->
      </div>
    </div>
  </div>
  <!-- StepManagement Card -->
  <Teleport v-if="stepCard.show" :to="`#step_teleport_anker_${stepCard.teleportTo}`">
    <WorkflowStepManagementCard
      v-on-click-outside.bubble="onCloseStepCard"
      :key="stepCard.teleportTo"
      :project-id="workflowData.project.id"
      :workflow-id="workflowData.id"
      :all-workflow-steps="steps"
      :workflow-step="workflowStepCardActive"
      @refresh="refresh"
      @close="onCloseStepCard"
      @show-settings="() => (sideBarOpen = true)"
      @prev-steps-updated="(obj) => onInputStepsUpdated(obj)"
    />
  </Teleport>
  <!-- CellCard -->
  <!--
  v-on-click-outside.bubble="onCloseCellCard"
  -->
  <Teleport v-if="cellCard.show" :to="`#cellcard_teleport_anker_x${cellCard.teleportTo.x}_y${cellCard.teleportTo.y}`">
    <WorkflowCellCard
      :key="`x${cellCard.teleportTo.x}_y${cellCard.teleportTo.y}`"
      :item-id="cellCard.contentId"
      :content="cellCard.content"
      @close="() => onCloseCellCard()"
      @refresh="refresh"
    />
  </Teleport>
  <!-- Settings Slider -->
  <!-- Sheet v-model:open="sideBarOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription> Under Construction </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </!-->

  <Teleport to="body" v-if="hasSelectedRows">
    <div class="absolute bottom-5 left-1/2 -translate-x-1/2">
      <div class="rounded-lg bg-neutral-50 px-3 py-0 text-xs shadow-md">
        <span class="pl-2 font-semibold">{{ selectedRows.length }}</span>
        <Button
          variant="ghost"
          size="icon"
          class="bg-parent ml-3 hover:scale-110 hover:bg-transparent"
          @click="onDeleteSelectedRows"
        >
          <Trash2Icon class="size-3 stroke-2 text-destructive" />
        </Button>
      </div>
    </div>
  </Teleport>
</template>

<style>
  .column {
    @apply grid w-fit border-0;
  }

  .index {
    @apply h-8 w-10 border-b border-l;
  }

  .index-last {
    @apply !border-b-0;
  }

  .cell {
    @apply relative h-8 w-40 border-b border-l p-2;
  }

  .cell-content {
    @apply relative overflow-hidden whitespace-pre-line break-words;
  }

  .cell-last {
    @apply !border-b-0;
  }

  .cell-content {
    @apply h-full w-full overflow-hidden text-ellipsis break-words;
  }

  .plus-button {
    @apply flex cursor-pointer items-center justify-center opacity-60 hover:bg-slate-100 hover:opacity-100;
  }
</style>
