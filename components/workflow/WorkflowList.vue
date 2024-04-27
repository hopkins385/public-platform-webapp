<script setup lang="ts">
  import { vOnClickOutside } from '@vueuse/components';
  import { PlusIcon } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
  }>();

  const showStepCard = ref(false);
  const teleportTo = ref(0);
  const showStepId = ref('');

  const { createWorkflowStep } = useManageWorkflowSteps();

  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflow,
    pending,
    refresh,
  } = await getFullWorkflow(props.workflowId);

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
    if (showStepCard.value && teleportTo.value === id) {
      showStepCard.value = false;
      return;
    }
    showStepCard.value = true;
    teleportTo.value = id;
    showStepId.value = stepId;
  }

  function onCloseStepCard() {
    showStepCard.value = false;
  }

  async function onAddWorkflowStep() {
    const highestOrderColumn = getHighestOrderColumn();
    await createWorkflowStep({
      workflowId: props.workflowId,
      projectId: workflow.value.project.id,
      name: 'New Step',
      description: 'New Step Description',
      orderColumn: highestOrderColumn + 1,
    });
    await refresh();
  }
</script>

<template>
  <div class="h-10 bg-stone-50"></div>

  <div class="h-screen overflow-x-auto bg-white p-0">
    <div class="grid w-fit grid-flow-col text-xs">
      <div class="grid w-12" id="column_number">
        <div
          class="flex h-9 items-center justify-center border-y-2 border-l-2 font-semibold"
        ></div>
        <div class="truncate border-l-2 bg-white">
          <div
            v-for="(step, index) in workflow.steps[0].document?.documentItems"
            class="flex h-9 items-center justify-center truncate border-b-2 opacity-50"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
      <template v-for="(step, index) in workflow.steps" :key="step.id">
        <div class="relative grid w-52">
          <div
            :id="`col_title_${index}`"
            class="flex h-9 cursor-pointer items-center border-y-2 border-l-2 px-2 font-semibold hover:bg-stone-100"
            @click.stop="() => toggleStepCard(index, step.id)"
            :class="{ 'bg-stone-100': showStepCard && teleportTo === index }"
          >
            {{ step.name }}
          </div>
          <div :id="`teleport_anker_${index}`" class="z-10"></div>
          <div
            class="h-9 truncate border-b-2 border-l-2 bg-white"
            v-for="item in step.document?.documentItems"
          >
            <div class="truncate p-2">{{ item?.content }}</div>
          </div>
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
        </div>
      </div>
    </div>
  </div>
  <Teleport v-if="showStepCard" :to="`#teleport_anker_${teleportTo}`">
    <WorkflowStepManagementCard
      v-on-click-outside.bubble="onCloseStepCard"
      :project-id="workflow.project.id"
      :workflow-id="workflow.id"
      :all-workflow-steps="workflow.steps"
      :workflow-step="workflowStepToManage"
      @refresh="refresh"
      @close="onCloseStepCard"
    />
  </Teleport>
</template>

<style scoped>
  div {
    @apply border-stone-100;
  }
</style>
