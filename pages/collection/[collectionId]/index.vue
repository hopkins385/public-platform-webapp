<script setup lang="ts">
  import { SettingsIcon } from 'lucide-vue-next';

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

  const refresh = ref(false);

  const { collectionId } = useRoute().params;
  const { findFirst } = useManageCollections();
  const { data: collection } = await findFirst(collectionId);

  if (!collection.value) {
    await navigateTo('/404');
  }

  // set meta label
  const route = useRoute();
  route.meta.breadcrumb.label = collection.value?.name || '...';

  async function onRefresh() {
    refresh.value = true;
    await nextTick();
    refresh.value = false;
  }
</script>

<template>
  <SectionContainer>
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between px-3 pb-2 pt-14">
          <div></div>
          <div class="flex flex-col space-y-2">
            <RecordCreateModal
              :collection-id="collection?.id"
              @refresh="onRefresh"
            />
            <LinkButton
              class="self-end"
              :to="`/collection/${collectionId}/edit`"
            >
              Collection Settings
              <SettingsIcon class="ml-2 size-4 stroke-2" />
            </LinkButton>
          </div>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <Suspense>
        <RecordAllTable :collectionId="collectionId" :refresh="refresh" />
      </Suspense>
    </BoxContainer>
  </SectionContainer>
</template>
