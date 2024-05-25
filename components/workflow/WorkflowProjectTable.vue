<script setup lang="ts">
  import { SettingsIcon, SquareArrowOutUpRightIcon, Trash2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    projectId: string | string[];
  }>();

  const showConfirmDialog = ref(false);
  const deleteWorkflowId = ref('');
  const errorAlert = reactive({
    show: false,
    message: '',
  });

  const { getProjectWorkflows, deleteWorkflow, setPage } = useManageWorkflows();
  const { data, refresh } = await getProjectWorkflows(props.projectId);

  const workflows = computed(() => data.value?.workflows || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function onOpenClick(id: string) {
    return navigateTo(`/projects/${props.projectId}/workflows/${id}`);
  }

  function onSettingsClick(id: string) {
    return navigateTo(`/projects/${props.projectId}/workflows/${id}/settings`);
  }

  function onDeleteClick(id: string) {
    deleteWorkflowId.value = id;
    showConfirmDialog.value = true;
  }

  async function handleDelete() {
    const toast = useToast();
    try {
      await deleteWorkflow(deleteWorkflowId.value);
      deleteWorkflowId.value = '';
      toast.success({
        description: 'Workflow has been deleted successfully.',
      });
      await refresh();
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error?.message;
    }
  }
</script>

<template>
  <div v-if="workflows.length > 0">
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table>
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + workflows.length : meta.totalCount }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Name </TableHead>
          <TableHead> Description</TableHead>
          <TableHead class="text-right"> Actions </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="workflow in workflows" :key="workflow.id">
          <TableCell class="whitespace-nowrap">{{ workflow.name }}</TableCell>
          <TableCell class="max-w-sm truncate">
            {{ workflow.description }}
          </TableCell>
          <TableCell class="space-x-2 whitespace-nowrap text-right">
            <Button class="group" variant="outline" size="icon" @click="() => onOpenClick(workflow.id)">
              <SquareArrowOutUpRightIcon class="size-4 stroke-1.5 text-primary group-hover:stroke-2" />
            </Button>
            <Button class="group" variant="outline" size="icon" @click="() => onSettingsClick(workflow.id)">
              <SettingsIcon class="size-4 stroke-1.5 text-primary group-hover:stroke-2" />
            </Button>
            <Button class="group" variant="outline" size="icon" @click="() => onDeleteClick(workflow.id)">
              <Trash2Icon class="size-4 stroke-1.5 text-destructive group-hover:stroke-2" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Pagination
      v-if="meta.totalCount > 10"
      v-slot="{ page }"
      :total="meta.totalCount"
      :sibling-count="1"
      show-edges
      :default-page="1"
      :items-per-page="10"
      @update:page="(value) => setPage(value)"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst />
        <PaginationPrev />

        <template v-for="(item, index) in items">
          <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button class="size-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :key="item.type" :index="index" />
        </template>

        <PaginationNext />
        <PaginationLast />
      </PaginationList>
    </Pagination>
  </div>
</template>
