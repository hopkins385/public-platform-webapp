<script setup lang="ts">
  import { SquareArrowOutUpRightIcon, Trash2Icon } from 'lucide-vue-next';

  defineProps<{
    meta: any;
    workflows: any;
  }>();

  const errorAlert = reactive({ show: false, message: '' });
  const showConfirmDialog = ref(false);

  const { getFileSizeForHumans } = useForHumans();

  function onDelete(id: string) {
    showConfirmDialog.value = true;
  }

  async function onOpenClick(projectId: string, workflowId: string) {
    return await navigateTo(`/project/${projectId}/workflow/${workflowId}`);
  }

  async function onPageChange(value: number) {}

  function handleDelete() {}
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
            ? meta.currentPage * 10 - 10 + workflows.length
            : meta.totalCount
        }}
        of total
        {{ meta.totalCount }}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead> Name </TableHead>
          <TableHead> Project </TableHead>
          <TableHead class="text-right"> Action </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in workflows || []" :key="item.id">
          <TableCell>
            {{ item.workflows[0]?.name }}
          </TableCell>
          <TableCell>{{ item.workflows[0]?.project?.name }}</TableCell>
          <TableCell class="space-x-2 text-right">
            <Button
              class="group"
              variant="outline"
              size="icon"
              @click="
                () =>
                  onOpenClick(
                    item.workflows[0].project.id,
                    item.workflows[0].id,
                  )
              "
            >
              <SquareArrowOutUpRightIcon
                class="size-4 stroke-1.5 text-primary group-hover:stroke-2"
              />
            </Button>
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
