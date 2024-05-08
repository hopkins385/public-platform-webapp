<script setup lang="ts">
  import { PlusIcon, SettingsIcon } from 'lucide-vue-next';

  /**
   * Collection Index - Show a collection
   * Route: /collection/:collectionId
   */

  definePageMeta({
    title: 'collections.meta.index.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Active Collection',
      label: '...',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidCollectionId(route.params);
    },
  });

  const { collectionId } = useRoute().params;
  const { findFirst } = useManageCollections();
  const { data: collection } = await findFirst(collectionId);

  // set meta label
  const route = useRoute();
  route.meta.breadcrumb.label = collection.value?.name || '...';
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div></div>
          <div class="flex flex-col space-y-2">
            <RecordCreateModal :collection-id="collectionId" />
            <Button
              class="self-end"
              variant="outline"
              @click="() => navigateTo(`/collection/${collectionId}/edit`)"
            >
              Collection Settings
              <SettingsIcon class="ml-2 size-4 stroke-2" />
            </Button>
          </div>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <div>{{ collection }}</div>
    </BoxContainer>
  </SectionContainer>
</template>
