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

  const breadcrumbLinks = computed(() => {
    return [
      { icon: 'users', label: 'Team', to: '/' },
      { icon: 'folders', label: 'Projects', to: '/project' },
      {
        icon: 'folder',
        label: 'Project',
        to: `/project/${projectId}`,
      },
      { icon: 'workflow', label: 'Workflows', to: `/project/${projectId}` },
      {
        icon: 'text',
        label: 'Workflow',
        to: `/project/${projectId}/workflow/${workflowId}`,
      },
    ];
  });

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
  <SectionContainerWithImage>
    <BreadcrumbBanner :links="breadcrumbLinks" class="-mt-4" />

    <BoxContainer :no-padding="true">
      <WorkflowList :workflow-id="workflowId as string" />
    </BoxContainer>
  </SectionContainerWithImage>
</template>
