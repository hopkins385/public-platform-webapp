<script setup lang="ts">
  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'workflow.meta.full.title',
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });

  const { projectId, workflowId } = useRoute().params;
  const { successDuration, errorDuration } = useAppConfig().toast;

  // full workflow
  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflow,
    pending,
    refresh,
  } = await getFullWorkflow(workflowId, {
    lazy: true,
  });
</script>

<template>
  <pre>{{ workflow }}</pre>
  <div>Full Workflow</div>
  <div><WorkflowList /></div>
</template>
