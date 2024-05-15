<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import {
    AlignLeftIcon,
    PlusIcon,
    LayoutDashboard,
    SettingsIcon,
    CircleChevronRight,
    ChevronDownIcon,
  } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
    projectId: string;
  }>();

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

  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflowData,
    refresh,
    error,
  } = await getFullWorkflow(props.workflowId);

  const steps = computed(() => workflowData.value?.steps || []);
  const rowCount = computed(
    () => steps.value[0]?.document.documentItems.length || 0,
  );
  const columnCount = computed(() => steps.value.length);

  // TODO: optimize this
  const { getAllAssistants } = useManageAssistants();
  const { data } = await getAllAssistants({ lazy: true });
  const allAssistants = computed(
    () =>
      data.value?.assistants.map((a: any) => {
        return { id: a.id, title: a.title };
      }) || [],
  );

  const workflowStepCardActive = computed(() => {
    return steps.value.find((step: any) => step.id === stepCard.workflowStepId);
  });

  const { resizeRowListener, resizeColumnListener, initSheetDimensions } =
    useResizeSheet();

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(props.workflowId);
  }

  async function onAddWorkflowStep() {
    const { createWorkflowStep } = useManageWorkflowSteps();
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
      orderColumn: columnCount.value + 1,
      rowCount: rowCount.value,
    });
    await refresh();
  }

  async function onAddWorkflowRow() {
    const { createManyDocumentItems } = useManageDocumentItems();
    const documentItems = workflowData.value.steps.map((step: any) => {
      return {
        documentId: step.document.id,
        orderColumn: step.document.documentItems.length + 1,
        content: '',
        status: 'draft',
        type: 'text',
      };
    });
    await createManyDocumentItems(documentItems);
    await refresh();
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
    if (
      cellCard.show &&
      cellCard.teleportTo.x === x &&
      cellCard.teleportTo.y === y
    ) {
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

  const socket = useWebsocket();
  function workflowUpdateListener(message: any) {
    console.log('workflow channel message', message);
    refresh();
  }

  onMounted(() => {
    initSheetDimensions(props.workflowId);
    socket.on(`workflow-${props.workflowId}-update`, workflowUpdateListener);
  });

  onBeforeUnmount(() => {
    socket.off(`workflow-${props.workflowId}-update`, workflowUpdateListener);
  });

  //
  const sideBarOpen = ref(false);
  const sheetRef = ref<HTMLElement | null>(null);
</script>

<template>
  <!-- Sheet-->
  <div class="p-4 text-sm" v-if="error || !workflowData">
    Ups something went wrong.<br />The Data you are looking for is not
    available.
  </div>
  <div @click="() => refresh()" class="hidden">Ref</div>
  <div
    ref="sheetRef"
    class="no-scrollbar flex overflow-visible bg-white pb-10 pr-10 text-xs"
    id="grid_list"
  >
    <!-- Row Index -->
    <div class="column" id="column_0">
      <div
        class="index relative flex items-center justify-center"
        id="row_0_cell_x0_y1"
      >
        <div v-if="sheetRef">
          <!-- TODO: optimize v-if sheetRef -->
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div class="rounded-lg border p-1">
                <ChevronDownIcon class="size-3 stroke-1.5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              :avoid-collisions="true"
              :loop="true"
              :collision-boundary="sheetRef"
            >
              <DropdownMenuLabel class="text-xs"> Workflow</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="w-full cursor-pointer text-xs"
                @click="() => onPlayClick()"
                as="button"
              >
                <CircleChevronRight class="mr-1 size-3 stroke-1.5" />
                Run all steps
              </DropdownMenuItem>
              <DropdownMenuItem class="text-xs">
                <NuxtLinkLocale
                  :to="`/project/${projectId}/workflow/${workflowData.id}/settings`"
                  class="flex w-full items-center"
                >
                  <SettingsIcon class="mr-1 size-3 stroke-1.5" />
                  Settings
                </NuxtLinkLocale>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        v-for="(count, rowIndex) in rowCount"
        :key="rowIndex"
        :id="`row_${rowIndex + 1}`"
        class="relative"
      >
        <div
          class="index group flex flex-col items-center justify-between"
          :id="`row_${rowIndex + 1}_cell_x0_y${rowIndex + 1}`"
        >
          <div class="flex h-full items-center pt-2 opacity-60">
            {{ rowIndex + 1 }}
          </div>
          <!-- Resize Row -->
          <div
            class="group/icon flex h-3 w-full cursor-ns-resize items-center px-2"
            style="padding-bottom: 0.1rem"
            @mousedown="
              (event) => resizeRowListener(event, rowIndex + 1, workflowId)
            "
          >
            <div
              class="h-1 w-full shrink-0 rounded-lg group-hover/icon:bg-slate-400 group-hover:bg-slate-200"
            ></div>
          </div>
        </div>
      </div>
      <!-- Add new Row -->
      <div class="index index-last plus-button" id="" @click="onAddWorkflowRow">
        <PlusIcon class="size-3 stroke-1.5" />
      </div>
    </div>
    <!-- WorkflowSteps as Columns -->
    <div
      v-for="(step, columnIndex) in steps"
      :key="columnIndex"
      :id="`column_${columnIndex}`"
      class="column relative"
    >
      <!-- Teleport Anker -->
      <div
        class="absolute left-0 top-8 z-10 overflow-visible"
        :id="`step_teleport_anker_${columnIndex}`"
      ></div>
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
            @mousedown="
              (event) => resizeColumnListener(event, columnIndex, workflowId)
            "
          ></div>
        </div>
      </div>
      <!-- DocumentItems as Rows -->
      <div
        v-for="(docItem, rowIndex) in step.document.documentItems"
        :id="`row_${rowIndex + 1}_cell_${columnIndex}`"
        :key="rowIndex"
        @click="
          () =>
            toggleCellCard(
              columnIndex,
              rowIndex + 1,
              docItem.content,
              docItem.id,
            )
        "
        class="cell group relative"
      >
        <!-- Cell content -->
        <div class="cell-content">
          {{ docItem.content }}
        </div>
        <!-- Row Detail Link -->
        <div
          v-if="columnIndex === 0"
          class="group/link absolute right-1 top-1 z-10 opacity-0 group-hover:opacity-100"
          @click="(e) => e.stopPropagation()"
        >
          <NuxtLinkLocale
            :to="`/workflow/${workflowData.id}/detail?row=${rowIndex}`"
            class="flex items-center justify-center rounded-lg border bg-white p-1 shadow-md group-hover/link:bg-slate-100"
          >
            <LayoutDashboard class="size-3 stroke-1" />
          </NuxtLinkLocale>
        </div>
        <!-- Cellcard teleport anker -->
        <div
          class="absolute left-0 top-0 z-10"
          :id="`cellcard_teleport_anker_x${columnIndex}_y${rowIndex + 1}`"
        ></div>
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
      <div
        v-for="(count, index) in rowCount"
        :key="index"
        :id="`row_${index + 1}_cell_last`"
        class="index"
      ></div>
      <div class="index index-last">
        <!-- div @mousedown="(e) => resizeAllListener(e, workflowId)">h</!-->
      </div>
    </div>
  </div>
  <!-- StepManagement Card -->
  <Teleport
    v-if="stepCard.show"
    :to="`#step_teleport_anker_${stepCard.teleportTo}`"
  >
    <WorkflowStepManagementCard
      v-on-click-outside.bubble="onCloseStepCard"
      :key="stepCard.teleportTo"
      :project-id="workflowData.project.id"
      :workflow-id="workflowData.id"
      :all-assistants="allAssistants"
      :all-workflow-steps="steps"
      :workflow-step="workflowStepCardActive"
      @refresh="refresh"
      @close="onCloseStepCard"
      @show-settings="() => (sideBarOpen = true)"
    />
  </Teleport>
  <!-- CellCard -->
  <!--
  v-on-click-outside.bubble="onCloseCellCard"
  -->
  <Teleport
    v-if="cellCard.show"
    :to="`#cellcard_teleport_anker_x${cellCard.teleportTo.x}_y${cellCard.teleportTo.y}`"
  >
    <WorkflowCellCard
      :key="`x${cellCard.teleportTo.x}_y${cellCard.teleportTo.y}`"
      :item-id="cellCard.contentId"
      :content="cellCard.content"
      @close="() => onCloseCellCard()"
      @refresh="refresh"
    />
  </Teleport>
  <!-- Settings Slider -->
  <Sheet v-model:open="sideBarOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription> Under Construction </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
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
    @apply relative h-8 w-52 border-b border-l p-2;
  }

  .cell-content {
    @apply relative overflow-hidden break-words;
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
