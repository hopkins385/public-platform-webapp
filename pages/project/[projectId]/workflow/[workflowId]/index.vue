<script setup lang="ts">
  import { PlayIcon } from 'lucide-vue-next';

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

  const { projectId, workflowId } = useRoute().params;

  const { executeWorkflow } = useExecuteWorkflow();
</script>

<template>
  <div class="bg-stone-50">
    <div class="p-2">
      <Button variant="outline" @click="executeWorkflow(workflowId)">
        <PlayIcon class="size-3" />
      </Button>
    </div>
  </div>
  <div class="bg-stone-50 p-1">
    <WorkflowList :workflow-id="workflowId as string" />
  </div>
</template>
