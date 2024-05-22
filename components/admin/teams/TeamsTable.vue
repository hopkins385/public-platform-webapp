<script setup lang="ts">
  import { SettingsIcon, Trash2Icon } from 'lucide-vue-next';

  const toast = useToast();

  const errorAlert = ref({ show: false, message: '' });
  const showConfirmDialog = ref(false);
  const deleteTeamId = ref('');

  const { deleteTeam, getTeamsAllPaginated, setPage } =
    useAdminTeamsSharedComp();
  const { data, refresh } = await getTeamsAllPaginated();

  const teams = computed(() => data.value?.teams || []);
  const meta = computed(() => {
    return {
      totalCount: data.value?.meta?.totalCount || 0,
      currentPage: data.value?.meta?.currentPage || 0,
    };
  });

  function onDelete(id: string) {
    showConfirmDialog.value = true;
    deleteTeamId.value = id;
  }

  async function handleDelete() {
    try {
      await deleteTeam(deleteTeamId.value);
      showConfirmDialog.value = false;
      await refresh();
      toast.success({ description: 'Team deleted successfully' });
    } catch (error) {
      errorAlert.value.show = true;
      errorAlert.value.message = error?.message || 'An error occurred';
    }
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
        {{
          meta.totalCount > 10
            ? meta.currentPage * 10 - 10 + teams.length
            : meta.totalCount
        }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Avatar </TableHead>
          <TableHead> Name </TableHead>
          <TableHead> ... </TableHead>
          <TableHead> ... </TableHead>
          <TableHead class="text-right"> Actions </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="team in teams" :key="team.id">
          <TableCell>
            <div class="size-8 rounded-full bg-slate-200"></div>
          </TableCell>
          <TableCell class="max-w-full truncate">
            {{ team.name }}
          </TableCell>
          <TableCell class="whitespace-nowrap"> ... </TableCell>
          <TableCell class="whitespace-nowrap"> ... </TableCell>
          <TableCell
            class="flex justify-end space-x-2 whitespace-nowrap text-right"
          >
            <LinkButton
              :to="`/admin/teams/${team.id}/edit`"
              variant="outline"
              size="icon"
            >
              <SettingsIcon class="size-4 stroke-1.5 text-primary" />
            </LinkButton>
            <Button
              variant="outline"
              size="icon"
              @click="() => onDelete(team.id)"
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
      @update:page="(value) => setPage(value)"
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
