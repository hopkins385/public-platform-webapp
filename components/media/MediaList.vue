<script setup lang="ts">
  import { FileIcon, Trash2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    refresh: boolean;
  }>();

  const emits = defineEmits<{
    'update:refresh': [boolean];
  }>();

  const { data: auth } = useAuth();
  const { findPaginateAllMediaFor, setPage, deleteMedia } = useManageMedia();
  const { $toast } = useNuxtApp();

  const showConfirmDialog = ref(false);
  const deleteMediaId = ref('');
  const errorAlert = reactive({ show: false, message: '' });

  const { data, pending, error, refresh } = await findPaginateAllMediaFor(
    { id: auth.value?.user.id, type: 'user' },
    { lazy: true },
  );

  const media = computed(() => data.value?.media || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function onEdit(id: string) {
    return navigateTo(`/media/${id}/edit`);
  }

  function onDelete(id: string) {
    deleteMediaId.value = id;
    showConfirmDialog.value = true;
  }

  function handleDelete() {
    const {
      toast: { successDuration },
    } = useAppConfig();

    const id = deleteMediaId.value;
    deleteMedia(id)
      .then(() => {
        deleteMediaId.value = '';
        $toast.success('Success', {
          description: 'Media has been deleted successfully.',
          duration: successDuration,
        });
        refresh();
      })
      .catch((error: any) => {
        errorAlert.show = true;
        errorAlert.message = error?.message;
      });
  }

  async function onPageChange(value: number) {
    setPage(value);
    await refresh();
  }

  watch(
    () => props.refresh,
    async (value) => {
      if (value) {
        await refresh();
        emits('update:refresh', false);
      }
    },
  );
</script>

<template>
  <div>
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table class="rounded-lg border bg-white">
      <TableCaption>
        Showing from
        {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
        to
        {{
          meta.totalCount > 10
            ? meta.currentPage * 10 - 10 + media.length
            : meta.totalCount
        }}
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
            <div
              class="flex size-8 items-center justify-center truncate rounded-full"
            >
              <FileIcon class="size-4" />
            </div>
          </TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell>
            {{ item.fileSize }}
          </TableCell>
          <TableCell class="space-x-2 text-right">
            <Button variant="outline" size="icon" @click="onDelete(item.id)">
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
