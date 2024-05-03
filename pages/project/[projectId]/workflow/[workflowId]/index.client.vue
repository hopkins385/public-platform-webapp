<script setup lang="ts">
  import { PlayIcon } from 'lucide-vue-next';

  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  definePageMeta({
    title: 'workflow.meta.full.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Workflow',
      label: 'Active Workflow',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });
  const route = useRoute();
  const { $socket } = useNuxtApp();
  const { projectId, workflowId } = useRoute().params;
  const { getWorkflowSettings } = useManageWorkflows();
  const { data } = getWorkflowSettings(workflowId);

  route.meta.breadcrumb.label = data.value?.name;

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(workflowId);
  }

  onMounted(() => {
    $socket.emit('join_room', { roomId: workflowId });
    console.log('connecting to room');

    $socket.on('connect', () => {
      console.log('connected to socket');
    });

    // new_message event
    $socket.on('new_message', (data) => {
      console.log('new message', data);
    });
  });

  onBeforeUnmount(() => {
    $socket.emit('leave_room', { roomId: workflowId });
    console.log('leaving room');
  });
</script>

<template>
  <div class="px-5 py-10">
    <BoxContainer class="p-5">
      <Button variant="outline" @click="onPlayClick">
        <PlayIcon class="size-3" />
      </Button>
    </BoxContainer>
    <BoxContainer class="mt-4 p-5">
      <WorkflowList :workflow-id="workflowId as string" />
    </BoxContainer>
  </div>
</template>
