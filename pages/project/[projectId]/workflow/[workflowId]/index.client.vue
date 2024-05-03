<script setup lang="ts">
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

  route.meta.breadcrumb.label = data.value.name;

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
  <SectionContainer>
    <BoxContainer :no-padding="true">
      <WorkflowList :workflow-id="workflowId as string" />
    </BoxContainer>
  </SectionContainer>
</template>
