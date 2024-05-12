<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import { useEventListener, useThrottleFn } from '@vueuse/core';
  import { PlayIcon, PlusIcon } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
  }>();

  const showStepCard = ref(false);
  const showItemCard = ref(false);
  const teleportStepCardTo = ref(0);
  const teleportItemCardTo = reactive({
    x: 0,
    y: 0,
  });
  const itemCardContent = ref('');
  const itemCardContentId = ref('');
  const showStepId = ref('');

  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflow,
    refresh,
    error,
  } = await getFullWorkflow(props.workflowId);

  const { getAllAssistants } = useManageAssistants();
  const {
    data: dataAssistants,
    refresh: refreshAssistants,
    error: errorAssistants,
  } = await getAllAssistants();

  const workflowStepToManage = computed(() => {
    if (!workflow.value?.steps.length) return null;
    return workflow.value.steps.find(
      (step: any) => step.id === showStepId.value,
    );
  });

  function getWorkflowStep(id: string) {
    if (!workflow.value?.steps.length) return null;
    return workflow.value.steps.find((step: any) => step.id === id);
  }

  function getHighestOrderColumn() {
    return Math.max(
      ...workflow.value.steps.map((step: any) => step.orderColumn),
    );
  }

  function toggleStepCard(id: number, stepId: string) {
    // close itemCard if open
    showItemCard.value = false;
    // if click again on the same step, close the card if it is open
    if (showStepCard.value && teleportStepCardTo.value === id) {
      showStepCard.value = false;
      return;
    }
    showStepCard.value = true;
    teleportStepCardTo.value = id;
    showStepId.value = stepId;
  }

  function toggleItemCard(x: number, y: number, content: string, id: string) {
    // if click again on the same item, close the card if it is open
    console.log('toggle item card');
    if (
      showItemCard.value &&
      teleportItemCardTo.x === x &&
      teleportItemCardTo.y === y
    ) {
      // showItemCard.value = false;
      return;
    }
    showItemCard.value = true;
    teleportItemCardTo.x = x;
    teleportItemCardTo.y = y;
    itemCardContent.value = content;
    itemCardContentId.value = id;
  }

  function onCloseStepCard() {
    showStepCard.value = false;
  }

  async function onCloseItemCard() {
    console.log('close item card');
    showItemCard.value = false;
    await refresh();
  }

  async function onAddWorkflowStep() {
    const { createWorkflowStep } = useManageWorkflowSteps();
    const highestOrderColumn = getHighestOrderColumn();
    const assistant = dataAssistants.value?.assistants[0];
    if (!assistant || !assistant?.id) {
      console.error('No assistant found');
      return;
    }
    await createWorkflowStep({
      workflowId: props.workflowId,
      projectId: workflow.value.project.id,
      assistantId: assistant.id,
      name: 'New Step',
      description: 'New Step Description',
      orderColumn: highestOrderColumn + 1,
      rowCount: workflow.value.steps[0].document?.documentItems.length ?? 1,
    });
    await refresh();
  }

  async function onAddWorkflowRow() {
    const { createManyDocumentItems } = useManageDocumentItems();
    const documentItems = workflow.value.steps.map((step: any) => {
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

  function setColumnWidth(e: MouseEvent, index: number) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const column = document.getElementById(`col_${index}`);
    if (!column) return;
    column.style.width = `${e.clientX - column.getBoundingClientRect().left}px`;
    // column.style.width = `${e.clientX / 16}rem`;
  }

  function resizeColumnListener(ev: MouseEvent, index: number) {
    const mouseMove = useEventListener('mousemove', (e) =>
      setColumnWidth(e, index),
    );

    addEventListener('mouseup', () => {
      mouseMove();
    });
  }

  function setRowHeight(e: MouseEvent, rowIndex: number) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const row = document.getElementById(`row_${rowIndex}`);
    if (!row) return;
    row.style.height = `${e.clientY - row.getBoundingClientRect().top}px`;
    // resize also all item heights
    const items = document.querySelectorAll(
      `[id^="item_x"][id$="_y${rowIndex}"]`,
    );
    items.forEach((item) => {
      item.style.height = `${e.clientY - row.getBoundingClientRect().top}px`;
    });
  }

  function resizeRowListener(ev: MouseEvent, rowIndex: number) {
    console.log('resize row listener');
    const mouseMove = useEventListener('mousemove', (e) =>
      setRowHeight(e, rowIndex),
    );

    addEventListener('mouseup', () => {
      mouseMove();
    });
  }

  // listen for esc key
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      showStepCard.value = false;
      showItemCard.value = false;
    }
  });

  useEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      // showStepCard.value = false;
      // showItemCard.value = false;
    }
  });

  onMounted(() => {
    const socket = useWebsocket();
    socket.emit('join_room', { roomId: props.workflowId });
    console.log('connecting to room');

    socket.on('connect', () => {
      console.log('connected to socket');
    });

    // new_message event
    socket.on('new_message', async (data) => {
      console.log('new message', data);
      // useThrottleFn(async () => {
      //   await refresh();
      // }, 500);
      await refresh();
    });
  });

  onBeforeUnmount(() => {
    const socket = useWebsocket();
    socket.emit('leave_room', { roomId: props.workflowId });
    console.log('leaving room');
  });
</script>

<template>
  <div @click="refresh">relfresh</div>
  <div class="h-screen overflow-x-scroll bg-white p-0">
    <div class="relative grid w-fit grid-flow-col text-xs">
      <div class="grid w-12" id="column_number">
        <div
          class="flex h-9 items-center justify-center border-y-2 border-l-2 font-semibold"
        ></div>
        <div class="border-l-2 bg-white">
          <div
            v-for="(step, rowIndex) in workflow.steps[0].document
              ?.documentItems"
            :key="rowIndex"
            :id="`row_${rowIndex}`"
            class="relative flex flex-col items-center justify-center truncate border-b-2 opacity-50"
            style="height: 3.15rem"
          >
            {{ rowIndex + 1 }}
            <div
              @mousedown="(e) => resizeRowListener(e, rowIndex)"
              class="absolute bottom-0 left-0 h-2 w-full cursor-move hover:bg-blue-600"
            ></div>
          </div>
        </div>
        <div
          class="flex h-9 cursor-pointer items-center justify-center border-l-2 font-semibold hover:bg-stone-100"
          @click="onAddWorkflowRow"
        >
          <PlusIcon class="size-3 cursor-pointer" />
        </div>
      </div>
      <template v-for="(step, columnIndex) in workflow.steps" :key="step.id">
        <div
          :id="`col_${columnIndex}`"
          class="relative grid"
          style="width: 14rem"
        >
          <div class="flex">
            <div
              :id="`col_title_${columnIndex}`"
              class="flex h-9 w-full cursor-pointer items-center border-y-2 border-l-2 bg-stone-50 px-2 font-semibold hover:bg-stone-100"
              @click.stop="() => toggleStepCard(columnIndex, step.id)"
              :class="{
                'bg-stone-100':
                  showStepCard && teleportStepCardTo === columnIndex,
              }"
            >
              {{ step.name }}
            </div>
            <div class="">
              <div
                class="h-full w-1 cursor-move hover:bg-blue-600"
                @mousedown="(e) => resizeColumnListener(e, columnIndex)"
              ></div>
            </div>
          </div>
          <div
            :id="`step_teleport_anker_${columnIndex}`"
            class="absolute left-2 top-10 z-10 size-0 bg-transparent"
          ></div>
          <div
            v-for="(item, rowIndex2) in step.document?.documentItems"
            class="relative border-b-2 border-l-2 bg-white hover:bg-stone-100"
            @click.stop="
              () =>
                toggleItemCard(columnIndex, rowIndex2, item?.content, item?.id)
            "
          >
            <div
              :id="`item_x${columnIndex}_y${rowIndex2}`"
              style="height: 3rem"
              class="max-h-full cursor-pointer overflow-hidden p-2"
            >
              <div class="overflow-hidden whitespace-pre-wrap">
                {{ item?.content }}
              </div>
            </div>
            <div
              :id="`item_teleport_anker_x${columnIndex}_y${rowIndex2}`"
              class="absolute left-0 top-0 z-10 size-0 bg-transparent"
            ></div>
          </div>
          <div class="h-9 border-l-2"></div>
        </div>
      </template>
      <div class="grid w-12" id="column_number">
        <div
          class="flex h-9 cursor-pointer items-center justify-center border-y-2 border-l-2 font-semibold hover:bg-stone-100"
          id="add_step"
          @click="onAddWorkflowStep"
        >
          <PlusIcon class="size-3 cursor-pointer" />
        </div>
        <div class="truncate border-l-2 bg-white" id="row">
          <div
            v-for="(item, index) in workflow.steps[0].document?.documentItems"
            class="flex h-9 items-center justify-center truncate border-b-2 opacity-50"
          ></div>
          <div class="h-9"></div>
        </div>
      </div>
    </div>
  </div>
  <Teleport
    v-if="showStepCard"
    :to="`#step_teleport_anker_${teleportStepCardTo}`"
  >
    <WorkflowStepManagementCard
      v-on-click-outside.bubble="onCloseStepCard"
      :key="teleportStepCardTo"
      :project-id="workflow.project.id"
      :workflow-id="workflow.id"
      :all-workflow-steps="workflow.steps"
      :all-assistants="dataAssistants?.assistants"
      :workflow-step="workflowStepToManage"
      @refresh="refresh"
      @close="onCloseStepCard"
    />
  </Teleport>
  <Teleport
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
  </Teleport>
</template>

<style scoped>
  div {
    @apply border-stone-100;
  }
</style>
