<script setup lang="ts">
  import { FileIcon } from 'lucide-vue-next';

  const props = defineProps<{
    collectionId: any;
    refresh: boolean;
  }>();

  const { findAllPaginated, setPage } = useManageRecords();
  const { data, refresh } = await findAllPaginated(props.collectionId);

  const records = computed(() => {
    return data.value?.records;
  });

  const meta = computed(() => {
    return data.value?.meta;
  });

  watchEffect(() => {
    if (props.refresh) {
      refresh();
    }
  });
</script>

<template>
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
      <TableRow v-for="item in records || []" :key="item?.id">
        <TableCell>
          <div class="flex size-8 items-center justify-center truncate rounded-full">
            <FileIcon class="size-4" />
          </div>
        </TableCell>
        <TableCell class="truncate">{{ item?.media?.name }}</TableCell>
        <TableCell> {{ item?.chunks?.length ?? 0 }} </TableCell>
        <TableCell class="space-x-2 text-right"> --- </TableCell>
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
