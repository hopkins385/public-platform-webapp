<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'collection.meta.index.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Collections',
      label: 'Collections',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Knowledge Collections" subtitle="Create, edit, and manage your knowledge collections" />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div></div>
          <LinkButton class="self-end" to="/collections/create">
            New Collection
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </LinkButton>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <Suspense>
        <CollectionTable />
      </Suspense>
    </BoxContainer>
  </SectionContainer>
</template>
