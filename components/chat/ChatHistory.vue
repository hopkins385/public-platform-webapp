<script setup lang="ts">
  import {
    FileEditIcon,
    MessageCircleMoreIcon,
    Trash2Icon,
  } from 'lucide-vue-next';

  const { getDateTimeForHumans } = useForHumans();
  const { getAllChatsForUser, deleteChat, setPage } = useChat();
  const { data, refresh } = await getAllChatsForUser();

  const chats = computed(() => data.value?.chats || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  const errorAlert = reactive({
    show: false,
    message: '',
  });
  const showConfirmDialog = ref(false);
  const chatIdToDelete = ref('');

  async function onPageChange(value: number) {
    setPage(value);
    await refresh();
  }

  function onDelete(chatId: string) {
    showConfirmDialog.value = true;
    chatIdToDelete.value = chatId;
  }

  async function handleDelete() {
    showConfirmDialog.value = false;
    try {
      const result = await deleteChat(chatIdToDelete.value);
    } catch (error) {
      errorAlert.show = true;
      errorAlert.message = error?.message ?? 'Unknown error occurred';
    }
    chatIdToDelete.value = '';
    await refresh();
  }
</script>

<template>
  <div v-if="chats.length > 0">
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />
    <div class="mb-4 rounded-xl border bg-white p-10">
      <Table>
        <TableCaption>
          Showing from
          {{ meta.totalCount > 10 ? meta.currentPage * 10 - 10 + 1 : 1 }}
          to
          {{
            meta.totalCount > 10
              ? meta.currentPage * 10 - 10 + chats.length
              : meta.totalCount
          }}
          of total
          {{ meta.totalCount }}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead> Title </TableHead>
            <TableHead> Assistant </TableHead>
            <TableHead> Ai Model </TableHead>
            <TableHead> Created At </TableHead>
            <TableHead class="text-right"> Actions </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="chat in data?.chats || []" :key="chat.id">
            <TableCell>{{ chat.title }}</TableCell>
            <TableCell>{{ chat.assistant.title }}</TableCell>
            <TableCell>{{ chat.assistant.llm.displayName }}</TableCell>
            <TableCell>
              {{ getDateTimeForHumans(chat.createdAt) }}
            </TableCell>
            <TableCell class="space-x-2 text-right">
              <LinkButton
                :to="`/chat/${chat.id}`"
                class="group"
                variant="outline"
                size="icon"
              >
                <MessageCircleMoreIcon class="size-4 stroke-1.5 text-primary" />
              </LinkButton>
              <Button
                variant="outline"
                size="icon"
                class="group"
                @click="onDelete(chat.id)"
              >
                <Trash2Icon
                  class="size-4 stroke-1 text-destructive group-hover:stroke-1.5"
                />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

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
  <div v-else class="w-full rounded-lg border p-10">
    <div class="">No chats found</div>
  </div>
</template>
