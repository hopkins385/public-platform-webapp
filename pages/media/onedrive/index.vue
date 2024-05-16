<script setup lang="ts">
  definePageMeta({
    title: 'One Drive',
    description: 'One Drive',
  });

  const { getProviderAuthTokens } = useProviderAuth();
  const { data: providerAuthTokens } = await getProviderAuthTokens('onedrive');

  async function onConnect() {
    const { data: url } = await useFetch('/api/onedrive/consent', {
      method: 'GET',
    });
    await navigateTo(url.value, { external: true });
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading title="One Drive" />
    <BoxContainer v-if="providerAuthTokens?.accessToken">
      <Suspense>
        <OnedriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
    <BoxContainer v-else>
      <div class="flex">
        <Button @click="onConnect"> Connect One Drive </Button>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
