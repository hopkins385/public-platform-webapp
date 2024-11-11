<script setup lang="ts">
  import { FileIcon, LoaderIcon, Trash2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    collectionId: string | undefined;
    refresh: boolean;
  }>();

  const { findAllPaginated, setPage, deleteRecord } = useManageRecords();
  const { data, refresh } = await findAllPaginated(props.collectionId);

  const records = computed(() => {
    return data.value?.records;
  });

  const meta = computed(() => {
    return data.value?.meta;
  });

  const showConfirmDialog = ref(false);
  const deleteRecordId = ref('');
  const isLoadingIds = ref<string[]>([]);

  const addIsLoading = (id: string) => {
    isLoadingIds.value.push(id);
  };

  const deleteIsLoading = (id: string) => {
    isLoadingIds.value = isLoadingIds.value.filter((i) => i !== id);
  };

  const onDelete = async (id: string) => {
    showConfirmDialog.value = true;
    deleteRecordId.value = id;
  };

  const handleDelete = async () => {
    const toast = useToast();
    addIsLoading(deleteRecordId.value);
    showConfirmDialog.value = false;
    try {
      await deleteRecord(deleteRecordId.value);
      toast.success({
        description: 'Record has been deleted successfully.',
      });
      await refresh();
    } catch (error: any) {
      toast.error({
        description: 'Failed to delete record.',
      });
    } finally {
      deleteRecordId.value = '';
      deleteIsLoading(deleteRecordId.value);
    }
  };

  watchEffect(() => {
    if (props.refresh) {
      refresh();
    }
  });
</script>

<template>
  <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />
  <Table>
    <TableCaption>
      Showing from
      {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
      to
      {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + records.length : meta.totalCount }}
      of total
      {{ meta.totalCount }}
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead> File </TableHead>
        <TableHead> Name </TableHead>
        <TableHead> Chunks </TableHead>
        <TableHead class="text-right"> Action </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="record in records || []" :key="record?.id">
        <TableCell>
          <div class="flex size-8 items-center justify-center truncate rounded-full">
            <FileIcon class="size-4" />
          </div>
        </TableCell>
        <TableCell class="truncate">{{ record?.media?.name }}</TableCell>
        <TableCell> {{ record?.chunks?.length ?? 0 }} </TableCell>
        <TableCell class="space-x-2 text-right">
          <Button class="group" variant="outline" size="icon" @click="onDelete(record.id)">
            <LoaderIcon
              v-if="isLoadingIds.includes(record.id)"
              class="size-4 animate-spin stroke-1.5 text-primary group-hover:stroke-2"
            />
            <Trash2Icon v-else class="size-4 stroke-1.5 text-destructive group-hover:stroke-2" />
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
</template>
