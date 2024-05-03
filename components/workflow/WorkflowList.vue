<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import { useEventListener } from '@vueuse/core';
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

  function toggleItemCard(x: number, y: number) {
    // if click again on the same item, close the card if it is open
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
  }

  function onCloseStepCard() {
    showStepCard.value = false;
  }

  function onCloseItemCard() {
    showItemCard.value = false;
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

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(props.workflowId);
  }

  // listen for esc key
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showStepCard.value = false;
      showItemCard.value = false;
    }
  });
</script>

<template>
  <div class="h-screen overflow-x-scroll bg-white p-0">
    <div class="w-full bg-stone-50">
      <div class="p-2">
        <Button variant="outline" @click="onPlayClick">
          <PlayIcon class="size-3" />
        </Button>
      </div>
    </div>
    <div class="relative grid w-fit grid-flow-col text-sm">
      <div class="grid w-12" id="column_number">
        <div
          class="flex h-9 items-center justify-center border-y-2 border-l-2 font-semibold"
        ></div>
        <div class="border-l-2 bg-white">
          <div
            v-for="(step, index) in workflow.steps[0].document?.documentItems"
            class="flex h-9 items-center justify-center truncate border-b-2 opacity-50"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div
          class="flex h-9 cursor-pointer items-center justify-center border-l-2 font-semibold hover:bg-stone-100"
          @click="onAddWorkflowRow"
        >
          <PlusIcon class="size-3 cursor-pointer" />
        </div>
      </div>
      <template v-for="(step, index) in workflow.steps" :key="step.id">
        <div class="relative grid w-60">
          <div
            :id="`col_title_${index}`"
            class="flex h-9 cursor-pointer items-center border-y-2 border-l-2 px-2 font-semibold hover:bg-stone-100"
            @click.stop="() => toggleStepCard(index, step.id)"
            :class="{
              'bg-stone-100': showStepCard && teleportStepCardTo === index,
            }"
          >
            {{ step.name }}
          </div>
          <div
            :id="`step_teleport_anker_${index}`"
            class="absolute left-2 top-10 z-10 size-0 bg-transparent"
          ></div>
          <div
            class="relative h-9 border-b-2 border-l-2 bg-white hover:bg-stone-100"
            @click.stop="() => toggleItemCard(index, index2)"
            v-for="(item, index2) in step.document?.documentItems"
          >
            <div class="cursor-pointer truncate p-2">{{ item?.id }}</div>
            <div
              :id="`item_teleport_anker_x${index}_y${index2}`"
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
      @close="onCloseItemCard"
      :key="`item_teleport_${teleportItemCardTo.x}_${teleportItemCardTo.y}`"
    />
  </Teleport>
</template>

<style scoped>
  div {
    @apply border-stone-100;
  }
</style>
