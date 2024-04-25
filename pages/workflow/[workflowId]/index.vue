<script setup lang="ts">
  // full workflow, includung steps
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'workflow.meta.full.title',
  });

  const route = useRoute();
  const { successDuration, errorDuration } = useAppConfig().toast;

  // full workflow
  const { getFullWorkflow } = useManageWorkflows();
  const { data: workflow, refresh } = await getFullWorkflow(
    route.params.workflowId,
  );
</script>

<template>
  <pre>{{ workflow }}</pre>
  <div>Full Workflow</div>
</template>
