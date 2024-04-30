<script setup lang="ts">
  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  definePageMeta({
    title: 'workflow.meta.full.title',
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });

  const { $socket } = useNuxtApp();
  const { projectId, workflowId } = useRoute().params;

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
  <div class="bg-stone-50 p-1">
    <WorkflowList :workflow-id="workflowId as string" />
  </div>
</template>
