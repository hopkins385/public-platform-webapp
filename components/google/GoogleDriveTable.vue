<script setup lang="ts">
  import { refDebounced } from '@vueuse/core';
  import { ArrowRightIcon, DownloadIcon, LoaderIcon } from 'lucide-vue-next';

  const props = defineProps<{
    id?: string | string[];
    pageToken?: string;
  }>();

  const search = ref('');
  const nextPageToken = ref<string | null>(
    Array.isArray(props.pageToken) ? props.pageToken[0] : props.pageToken,
  );
  const folderId = ref(Array.isArray(props.id) ? props.id[0] : props.id);
  const fileDonwloadPending = ref<string | null>(null);

  const debouncedSearch = refDebounced(search, 500);

  const {
    data: result,
    refresh,
    pending,
  } = await useFetch('/api/google/drive', {
    method: 'GET',
    query: {
      search: debouncedSearch,
      folderId,
      pageToken: nextPageToken,
    },
    watch: [folderId, debouncedSearch, nextPageToken],
  });

  const submitDisabled = computed(() => search.value === '' || pending.value);

  const onSubmit = async () => {
    if (submitDisabled.value) return;
    await refresh();
  };

  const onRowClick = (file: any) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return navigateTo(`/media/google/${file.id}`);
    }
  };

  const onNextClick = () => {
    if (!result.value?.data?.nextPageToken) return;
    nextPageToken.value = result.value?.data?.nextPageToken;
  };

  const downloadFile = async (id: string | undefined | null) => {
    if (!id) return;
    const file = result.value?.data?.files?.find((f) => f.id === id);
    if (!file) return;
    if (fileDonwloadPending.value === id) return;
    fileDonwloadPending.value = id;
    const { data, error, pending } = await useFetch('/api/google/download', {
      method: 'GET',
      params: {
        fileId: id,
      },
    });

    console.log(data.value, error.value);
    fileDonwloadPending.value = null;
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
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="result?.data?.files?.length === 0">
          <TableCell colspan="4"> No files found </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            v-if="folderId && !nextPageToken && !pending"
            id="back"
            colspan="4"
            class="cursor-pointer"
            @click="$router.back()"
          >
            ...
          </TableCell>
          <TableCell
            v-if="nextPageToken && !pending"
            id="back"
            colspan="4"
            class="cursor-pointer"
            @click="nextPageToken = null"
          >
            ...
          </TableCell>
        </TableRow>
        <TableRow
          v-for="(file, index) in result?.data?.files"
          :key="index"
          :class="
            file?.mimeType === 'application/vnd.google-apps.folder'
              ? 'cursor-pointer'
              : ''
          "
          @click="onRowClick(file)"
        >
          <TableCell class="truncate">
            <component
              :is="fileIcon(file?.mimeType)"
              class="mr-2 inline-block size-5 fill-slate-100 stroke-slate-600 stroke-1.5"
            />
            {{ file?.name }}
          </TableCell>
          <TableCell>{{ file?.owner }}</TableCell>
          <TableCell>{{ getDateTimeForHumans(file?.modifiedTime) }}</TableCell>
          <TableCell
            >{{ file?.size ? getFileSizeForHumans(file?.size) : '-' }}
          </TableCell>
          <TableCell>
            <div v-if="file?.size">
              <Button
                variant="outline"
                size="icon"
                class="group"
                @click="downloadFile(file?.id)"
              >
                <LoaderIcon
                  v-if="fileDonwloadPending === file?.id"
                  class="size-4 animate-spin stroke-1.5"
                />
                <DownloadIcon
                  v-else
                  class="size-4 stroke-1.5 group-hover:stroke-2"
                />
              </Button>
            </div>
            <div v-else>-</div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div
      v-if="result?.data?.nextPageToken"
      class="flex flex-col items-center justify-center text-slate-400"
    >
      <Button
        variant="outline"
        size="icon"
        class="size-9"
        @click="onNextClick()"
      >
        <ArrowRightIcon class="size-4" />
      </Button>
      <span class="pt-2 text-xs">{{ $t('Next Page') }}</span>
    </div>
  </div>
</template>
