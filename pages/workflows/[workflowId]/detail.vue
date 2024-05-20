<script setup lang="ts">
  /**
   * Workflow - Single Workflow
   * Route: workflow/${workflowId}/detail
   */
  definePageMeta({
    title: 'workflow.meta.detail.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Workflow',
      label: 'Workflow Detail',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidWorkflowId(route.params);
    },
  });

  const showRaw = ref(false);

  const route = useRoute();
  const router = useRouter();
  const { workflowId } = route.params;
  const { row } = route.query;

  const rowNumber = ref(Number(row));

  const { getFullWorkflow } = useManageWorkflows();
  const { data: workflow, refresh, error } = await getFullWorkflow(workflowId);

  const workflowFilteredSteps = computed(() => {
    // only keep steps that have a documentItem with the given row
    return workflow.value?.steps.map((step: any) => {
      const filteredDocumentItems = step.document.documentItems?.filter(
        (item: any) => item.orderColumn === rowNumber.value,
      );
      return {
        ...step,
        document: {
          ...step.document,
          documentItems: filteredDocumentItems || [],
        },
      };
    });
  });

  function up() {
    if (rowNumber.value === 0) return;
    rowNumber.value = rowNumber.value - 1;
    // update the query parameter
    router.replace({ query: { row: rowNumber.value } });
  }

  function down() {
    if (rowNumber.value === 10) return;
    rowNumber.value = rowNumber.value + 1;
    // update the query parameter but without history
    router.replace({ query: { row: rowNumber.value } });
  }
</script>

<template>
  <div class="grid grid-cols-4">
    <div class="col-span-3">
      <div class="space-x-4 px-10 pt-5">
        <Button variant="outline" class="text-xs" size="sm" @click="up"
          >Up</Button
        >
        <Button variant="outline" class="text-xs" size="sm" @click="down"
          >Down</Button
        >
      </div>
      <div class="flex flex-col p-4 text-xs">
        <div
          v-for="(step, index) in workflowFilteredSteps"
          class="m-4 h-fit w-96 rounded-lg border bg-white p-4 shadow-md"
        >
          <div class="">
            <div id="header" class="py-2 font-semibold">
              {{ step.name }}
            </div>
            <div id="content">
              <div v-for="(item, index) in step.document.documentItems">
                <div>{{ item.content }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showRaw">
          <div>WFid: {{ workflowId }}</div>
          <div>Row: {{ row }}</div>
          <div>
            <pre>{{ workflowFilteredSteps }}</pre>
          </div>
          <div class="">
            <pre>{{ workflow }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
