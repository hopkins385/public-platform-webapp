<script setup lang="ts">
  import {
    FileEditIcon,
    SettingsIcon,
    SquareArrowOutUpRightIcon,
    Trash2Icon,
  } from 'lucide-vue-next';

  const showConfirmDialog = ref(false);
  const errorAlert = reactive({
    show: false,
    message: '',
  });
  const deleteCollectionId = ref('');

  const { findAllPaginated, setPage, deleteCollection } =
    useManageCollections();
  const { data: allCollections, refresh } = await findAllPaginated();

  const collections = computed(() => allCollections.value?.collections || []);
  const meta = computed(() => {
    return {
      totalCount: allCollections.value?.meta?.totalCount || 0,
      currentPage: allCollections.value?.meta?.currentPage || 0,
    };
  });

  function onPageChange(value: number) {
    setPage(value);
    refresh();
  }

  function onOpen(id: string) {
    return navigateTo(`/collections/${id}`);
  }

  function onDelete(id: string) {
    deleteCollectionId.value = id;
    showConfirmDialog.value = true;
  }

  async function handleDelete() {
    const toast = useToast();
    try {
      await deleteCollection(deleteCollectionId.value);
      deleteCollectionId.value = '';
      toast.success({
        description: 'Collection has been deleted successfully.',
      });
      await refresh();
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error?.message;
    }
  }
</script>

<template>
  <div v-if="collections.length > 0">
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table>
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{
          meta.totalCount > 10
            ? meta.currentPage * 10 - 10 + collections.length
            : meta.totalCount
        }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Name </TableHead>
          <TableHead> Description </TableHead>
          <TableHead> Records </TableHead>
          <TableHead class="text-right"> Actions </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="collection in collections" :key="collection.id">
          <TableCell class="max-w-xl truncate">
            {{ collection.name }}
          </TableCell>
          <TableCell class="max-w-xl truncate">{{
            collection.description
          }}</TableCell>
          <TableCell>
            {{ collection.records.length }}
          </TableCell>
          <TableCell class="space-x-2 text-right">
            <Button
              class="group"
              variant="outline"
              size="icon"
              @click="onOpen(collection.id)"
            >
              <SquareArrowOutUpRightIcon
                class="size-4 stroke-1.5 text-primary group-hover:stroke-2"
              />
            </Button>
            <Button
              class="group"
              variant="outline"
              size="icon"
              @click="onDelete(collection.id)"
            >
              <Trash2Icon
                class="size-4 stroke-1.5 text-destructive group-hover:stroke-2"
              />
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
