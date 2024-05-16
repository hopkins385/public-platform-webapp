<script setup lang="ts">
  import { refDebounced } from '@vueuse/core';

  const props = defineProps<{
    id?: string | string[];
  }>();

  const search = ref('');
  const itemId = ref(Array.isArray(props.id) ? props.id[0] : props.id);

  const debouncedSearch = refDebounced(search, 500);

  const {
    data: items,
    refresh,
    pending,
  } = await useFetch('/api/onedrive/items', {
    method: 'GET',
    query: {
      search: debouncedSearch,
      itemId,
    },
    watch: [itemId, debouncedSearch],
  });

  const submitDisabled = computed(() => search.value === '' || pending.value);

  const onSubmit = async () => {
    if (submitDisabled.value) return;
    await refresh();
  };

  const onRowClick = (item: any) => {
    if (item?.file) return;
    return navigateTo(`/media/onedrive/${item.id}`);
  };

  const { fileIcon } = useGoogleDrive();
  const { getDateTimeForHumans, getFileSizeForHumans } = useForHumans();
</script>

<template>
  <div>
    <div>
      <SearchFileBar
        v-model="search"
        :pending="pending"
        :submit-disabled="submitDisabled"
        @submit="onSubmit"
      />
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="(item, index) in items?.data?.value"
          :key="index"
          :class="item?.file ? '' : 'cursor-pointer'"
          @click="onRowClick(item)"
        >
          <TableCell class="truncate">
            <component
              :is="fileIcon(item?.file?.mimeType ?? 'folder')"
              class="mr-2 inline-block size-5 fill-slate-100 stroke-slate-600 stroke-1.5"
            />
            {{ item?.name }}
          </TableCell>
          <TableCell>{{ item?.owner }}</TableCell>
          <TableCell>{{
            getDateTimeForHumans(item?.lastModifiedDateTime)
          }}</TableCell>
          <TableCell>{{
            item?.size ? getFileSizeForHumans(item?.size) : '-'
          }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
