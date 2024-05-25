<script setup lang="ts">
  import { FileIcon, PlusIcon, Loader2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    collectionId: string | string[];
  }>();

  const emits = defineEmits<{
    success: [void];
  }>();

  const errorAlert = reactive({ show: false, message: '' });
  const pendingUpdateId = ref<string | null>(null);

  const { findPaginateAllMediaFor, setPage, setLimit } = useManageMedia();

  setLimit(5);

  const { data: auth } = useAuth();
  const { data, pending, error, refresh } = await findPaginateAllMediaFor({
    id: auth.value?.user.id,
    type: 'user',
  });

  const media = computed(() => data.value?.media || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  const { getFileSizeForHumans } = useForHumans();

  async function onAdd(id: string) {
    const { createRecord } = useManageRecords();
    const toast = useToast();
    pendingUpdateId.value = id;
    errorAlert.show = false;
    try {
      await createRecord({
        collectionId: props.collectionId.toString(),
        mediaId: id,
      });
      pendingUpdateId.value = null;
      toast.success({ description: 'Record created successfully' });
      emits('success');
    } catch (error) {
      pendingUpdateId.value = null;
      errorAlert.show = true;
      errorAlert.message = error.message;
    }
  }
</script>

<template>
  <div>
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />

    <Table class="rounded-lg border bg-white">
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + media.length : meta.totalCount }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> File </TableHead>
          <TableHead> Name </TableHead>
          <TableHead> File Size </TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in media || []" :key="item.id">
          <TableCell>
            <div class="flex size-8 items-center justify-center truncate rounded-full">
              <FileIcon class="size-4" />
            </div>
          </TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell>
            {{ getFileSizeForHumans(item.fileSize) }}
          </TableCell>
          <TableCell class="space-x-2 text-right">
            <Button variant="outline" size="icon" @click="onAdd(item.id)" :disabled="pendingUpdateId == item.id">
              <span v-if="pendingUpdateId == item.id" class="animate-spin">
                <Loader2Icon class="size-4" />
              </span>
              <PlusIcon v-else class="size-4" />
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
