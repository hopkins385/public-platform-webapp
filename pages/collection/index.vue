<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'collections.meta.index.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Collections',
      label: 'Collections',
    },
  });
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div></div>
          <Button
            class="self-end"
            variant="outline"
            @click="() => navigateTo(`/collection/create`)"
          >
            New Collection
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </Button>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <div>Col</div>
    </BoxContainer>
  </SectionContainer>
</template>
