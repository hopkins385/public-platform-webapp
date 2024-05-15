<script setup lang="ts">
  definePageMeta({
    title: 'Google Drive',
    description: 'Google Drive',
    validate: (route) => {
      // Check if the id is made up of digits
      if (!route.params.id) return false;
      if (Array.isArray(route.params.id)) return false;
      // return /^\d+$/.test(route.params.id); // TODO: validate id
      return true;
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Google Drive" />
    <BoxContainer class="pb-10">
      <Suspense>
        <GoogleDriveTable :id="$route.params?.id" />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
    <div class="h-10"></div>
  </SectionContainer>
</template>
