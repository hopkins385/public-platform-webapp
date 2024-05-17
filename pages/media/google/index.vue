<script setup lang="ts">
  definePageMeta({
    title: 'Google Drive',
    description: 'Google Drive',
  });

  const { getProviderAuthTokens } = useProviderAuth();
  const { data: providerAuthTokens } =
    await getProviderAuthTokens('googledrive');

  async function onConnect() {
    const { data: url } = await useFetch('/api/google/consent', {
      method: 'GET',
    });
    await navigateTo(url.value, { external: true });
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Google Drive" />
    <BoxContainer v-if="providerAuthTokens?.accessToken">
      <Suspense>
        <GoogleDriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
    <BoxContainer v-else>
      <div class="flex">
        <Button @click="onConnect"> Connect Google Drive </Button>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
