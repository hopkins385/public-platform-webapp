<script setup lang="ts">
  import { SettingsIcon, Trash2Icon, MessageSquareIcon } from 'lucide-vue-next';

  const showConfirmDialog = ref(false);
  const errorAlert = reactive({
    show: false,
    message: '',
  });
  const deleteAssistantId = ref('');
  const { getAllAssistants, deleteAssistant, setPage } = useManageAssistants();
  const { data, refresh } = await getAllAssistants();
  const { data: auth } = useAuth();

  const assistants = computed(() => data.value?.assistants || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  const handleDelete = async () => {
    const toast = useToast();
    const id = deleteAssistantId.value;
    try {
      await deleteAssistant(id, auth.value?.user.teamId);
      deleteAssistantId.value = '';
      toast.success({
        description: 'Assistant has been deleted successfully.',
      });
      refresh();
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error?.message;
    }
  };

  async function onStart(assistantId: string) {
    const { createChat } = useChat();
    const chat = await createChat(assistantId);
    if (!chat) {
      errorAlert.message = 'Failed to create chat';
      errorAlert.show = true;
      return;
    }
    return await navigateTo(`/chat/${chat.id}`);
  }

  async function onEdit(id: string) {
    return await navigateTo(`/assistant/${id}/edit`);
  }

  function onDelete(id: string) {
    deleteAssistantId.value = id;
    showConfirmDialog.value = true;
  }

  function onPageChange(value: number) {
    setPage(value);
    refresh();
  }
</script>

<template>
  <div v-if="assistants.length > 0">
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <ConfirmDialog v-model="showConfirmDialog" @confirm="handleDelete" />

    <Table>
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
          <TableHead> Avatar </TableHead>
          <TableHead> Title </TableHead>
          <TableHead> Shared </TableHead>
          <TableHead> Ai Model </TableHead>
          <TableHead class="text-right"> Actions </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="assistant in data?.assistants || []"
          :key="assistant.id"
        >
          <TableCell>
            <div class="size-8 rounded-full bg-slate-200"></div>
          </TableCell>
          <TableCell>{{ assistant.title }}</TableCell>
          <TableCell>
            {{ assistant.isShared ? 'Organisation' : 'Team' }}
          </TableCell>
          <TableCell>{{ assistant.llm.displayName }}</TableCell>
          <TableCell class="flex justify-end space-x-2 text-right">
            <Button variant="outline" @click="onStart(assistant.id)">
              New Chat
              <MessageSquareIcon
                class="ml-2 size-4 shrink-0 stroke-1.5 text-primary"
              />
            </Button>
            <Button variant="outline" size="icon" @click="onEdit(assistant.id)">
              <SettingsIcon class="size-4 stroke-1.5 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              @click="onDelete(assistant.id)"
            >
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
