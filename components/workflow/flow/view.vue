<script setup lang="ts">
  import { MoveDownIcon } from 'lucide-vue-next';

  const props = defineProps<{
    workflowId: string;
  }>();

  const { getFullWorkflow } = useManageWorkflows();
  const {
    data: workflowData,
    refresh,
    error,
  } = await getFullWorkflow(props.workflowId);

  const steps = computed(() => workflowData.value?.steps || []);
</script>

<template>
  <div class="flex w-fit flex-col p-10 text-sm">
    <div v-for="(step, index) in steps">
      <div
        class="flex rounded-lg border bg-stone-50 px-5 py-2 text-xs shadow-sm"
      >
        {{ step.name }}
      </div>
      <div class="w-full py-5" v-if="steps.length - 1 !== index">
        <div class="mx-auto w-fit">
          <MoveDownIcon class="size-4 stroke-1.5 opacity-80" />
        </div>
      </div>
    </div>
  </div>
</template>
