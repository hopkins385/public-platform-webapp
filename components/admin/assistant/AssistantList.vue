<script setup lang="ts">
  import { FileEditIcon, Trash2Icon } from 'lucide-vue-next';

  const showConfirmDialog = ref(false);
  const errorAlert = reactive({
    show: false,
    message: '',
  });
  const deleteAssistantId = ref('');
  const { successDuration } = useAppConfig().toast;
  const { $toast } = useNuxtApp();
  const { getAllAssistants, deleteAssistant, setPage } = useManageAssistants();
  const { data, refresh } = await getAllAssistants();

  const assistants = computed(() => data.value?.assistants || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  const onEdit = (id: string) => {
    return navigateTo(`/admin/assistant/${id}`);
  };

  const handleDelete = async () => {
    const id = deleteAssistantId.value;
    try {
      await deleteAssistant(id);
      deleteAssistantId.value = '';
      $toast.success('Success', {
        description: 'Assistant has been deleted successfully.',
        duration: successDuration,
      });
      refresh();
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error?.message;
    }
  };

  const onDelete = (id: string) => {
    deleteAssistantId.value = id;
    showConfirmDialog.value = true;
  };

  const onPageChange = (value: number) => {
    setPage(value);
    refresh();
  };
</script>

<template>
  <div v-if="assistants.length > 0">
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table class="rounded-lg border bg-white">
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{
          meta.totalCount > 10
            ? meta.currentPage * 10 - 10 + assistants.length
            : meta.totalCount
        }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Color </TableHead>
          <TableHead> Title </TableHead>
          <TableHead> Shared </TableHead>
          <TableHead class="text-right"> Actions </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="assistant in data?.assistants || []"
          :key="assistant.id"
        >
          <TableCell>
            <div class="size-10 rounded-full bg-green-200"></div>
          </TableCell>
          <TableCell>{{ assistant.title }}</TableCell>
          <TableCell>
            {{ assistant.isShared ? 'Shared' : 'Not Shared' }}
          </TableCell>
          <TableCell class="space-x-2 text-right">
            <Button variant="outline" size="icon" @click="onEdit(assistant.id)">
              <FileEditIcon class="size-4 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              @click="onDelete(assistant.id)"
            >
              <Trash2Icon class="size-4 text-destructive" />
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
      @update:page="(value) => onPageChange(value)"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst />
        <PaginationPrev />

        <template v-for="(item, index) in items">
          <PaginationListItem
            v-if="item.type === 'page'"
            :key="index"
            :value="item.value"
            as-child
          >
            <Button
              class="size-10 p-0"
              :variant="item.value === page ? 'default' : 'outline'"
            >
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
