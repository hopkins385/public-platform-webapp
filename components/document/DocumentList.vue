<script setup lang="ts">
  import { EditIcon, FileIcon, Trash2Icon } from 'lucide-vue-next';

  const showConfirmDialog = ref(false);
  const errorAlert = reactive({ show: false, message: '' });
  const deleteDocumentId = ref('');

  const toast = useToast();
  const projectStore = useProjectStore();

  const { getAllDocuments, deleteDocument, setPage } = useManageDocuments();
  const { data, refresh: refreshDocuments } = await getAllDocuments(projectStore.activeProjectId);

  const documents = computed(() => data.value?.documents || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function handleDelete() {
    const id = deleteDocumentId.value;
    deleteDocument(id)
      .then(() => {
        deleteDocumentId.value = '';
        toast.success({
          description: 'Document has been deleted successfully.',
        });
        refreshDocuments();
      })
      .catch((error: any) => {
        errorAlert.show = true;
        errorAlert.message = error?.message;
      });
  }

  function onDelete(id: string) {
    deleteDocumentId.value = id;
    showConfirmDialog.value = true;
  }

  function onEditClick(id: string) {
    navigateTo(`/documents/${id}/edit`);
  }
</script>

<template>
  <div>
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table>
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + documents.length : meta.totalCount }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Document </TableHead>
          <TableHead> Name </TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in documents || []" :key="item.id">
          <TableCell>
            <div class="flex size-8 items-center justify-center truncate rounded-full">
              <FileIcon class="size-4" />
            </div>
          </TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell class="space-x-2 text-right">
            <Button variant="outline" size="icon" @click="onEditClick(item.id)">
              <EditIcon class="size-4 stroke-1.5" />
            </Button>
            <Button variant="outline" size="icon" @click="onDelete(item.id)">
              <Trash2Icon class="size-4 stroke-1.5 text-destructive" />
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
