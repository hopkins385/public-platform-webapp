<script setup lang="ts">
  /**
   * Collection Index - Show a collection
   * Route: /collections/:collectionId
   */
  import { SettingsIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'collection.meta.index.title',
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

  const refresh = ref(false);

  const collectionId = useRoute().params?.collectionId.toString() || '';
  const { findFirst } = useManageCollections();
  const { data: collection } = await findFirst(collectionId);

  async function onRefresh() {
    refresh.value = true;
    await nextTick();
    refresh.value = false;
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading :title="collection?.name" :subtitle="collection?.description" />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div></div>
          <div class="flex flex-col space-y-2">
            <RecordCreateModal :collection-id="collection.id" @refresh="onRefresh" />
            <LinkButton class="self-end" :to="`/collections/${collectionId}/edit`">
              Collection Settings
              <SettingsIcon class="ml-2 size-4 stroke-2" />
            </LinkButton>
          </div>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <Suspense>
        <RecordAllTable :collection-id="collectionId" :refresh="refresh" />
      </Suspense>
    </BoxContainer>
  </SectionContainer>
</template>
