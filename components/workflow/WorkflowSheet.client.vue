<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import {
    AlignLeftIcon,
    PlusIcon,
    ExpandIcon,
    LayoutDashboard,
  } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
  }>();

  const stepCard = reactive({
    show: false,
    teleportTo: 0,
    workflowStepId: '',
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

  const { resizeRowListener, resizeColumnListener } = useResizeSheet();

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
    stepCard.show = true;
    stepCard.teleportTo = id;
    stepCard.workflowStepId = stepId;
  }

  function onCloseStepCard() {
    stepCard.show = false;
    stepCard.teleportTo = 0;
    stepCard.workflowStepId = '';
  }
</script>

<template>
  <!-- Sheet-->
  <div class="p-4 text-sm text-destructive" v-if="error || !workflowData">
    Ups something went wrong.<br />The Data you are looking for is not
    available.
  </div>
  <div @click="() => refresh()" class="hidden">Ref</div>
  <div class="no-scrollbar flex bg-white text-xs" id="grid_list">
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
          class="index group flex flex-col items-center justify-between"
          :id="`row_${index + 1}_cell_x0_y${index + 1}`"
        >
          <div class="flex h-full items-center pt-2 opacity-60">
            {{ index + 1 }}
          </div>
          <!-- Resize Row -->
          <div
            class="group/icon flex h-3 w-full cursor-ns-resize items-center px-2"
            style="padding-bottom: 0.1rem"
            @mousedown="
              (event) => resizeRowListener(event, index + 1, workflowId)
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
        class="absolute left-0 top-8 z-10"
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
        class="cell group"
      >
        <div class="relative">
          {{ docItem.content }}
          <!-- Row Detail Link -->
          <div
            v-if="columnIndex === 0"
            class="group/link absolute -top-1 right-0 opacity-0 group-hover:opacity-100"
          >
            <NuxtLinkLocale
              :to="`/workflow/${workflowData.id}/detail?row=${rowIndex}`"
              class="flex items-center justify-center rounded-lg border bg-white p-1 shadow-md group-hover/link:bg-slate-100"
            >
              <LayoutDashboard class="size-3 stroke-1" />
            </NuxtLinkLocale>
          </div>
        </div>
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
      <div class="index index-last"></div>
    </div>
  </div>
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
      :all-workflow-steps="workflowData.steps"
      :workflow-step="workflowStepCardActive"
      @refresh="refresh"
      @close="onCloseStepCard"
    />
  </Teleport>
  <!-- Teleport
    v-if="showItemCard"
    :to="`#item_teleport_anker_x${teleportItemCardTo.x}_y${teleportItemCardTo.y}`"
  >
    <WorkflowItemCard
      v-on-click-outside.bubble="onCloseItemCard"
      @close="() => onCloseItemCard()"
      :key="`item_teleport_${teleportItemCardTo.x}_${teleportItemCardTo.y}`"
      :item-id="itemCardContentId"
      :content="itemCardContent"
      @refresh="refresh"
    />
  </!-->
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

  .index-last {
    @apply !border-b-0;
  }

  .cell {
    @apply h-8 w-52 overflow-hidden break-words border-b border-l p-2;
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
