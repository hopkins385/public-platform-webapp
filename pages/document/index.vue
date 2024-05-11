<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'document.meta.index.title',
    breadcrumb: {
      icon: 'file',
      ariaLabel: 'Document Index',
      label: 'Document',
    },
  });

  const filterProjectId = ref<string | undefined>(undefined);

  function onClearProjectFilter() {
    filterProjectId.value = undefined;
  }

  async function onUpdateProjectFilter(value: string) {
    filterProjectId.value = value;
  }
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div>
            <div class="mb-1 p-1 text-xs font-semibold">Filter</div>
            <div class="flex space-x-2">
              <ProjectSelect
                :projectId="filterProjectId"
                @update:projectId="onUpdateProjectFilter"
              />
              <Button variant="ghost" @click="onClearProjectFilter">
                Clear Filter
              </Button>
            </div>
          </div>
          <LinkButton class="self-end" to="/workflow/create">
            New Document
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </LinkButton>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <div>Document Index</div>
    </BoxContainer>
  </SectionContainer>
</template>
