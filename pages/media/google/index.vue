<script setup lang="ts">
  definePageMeta({
    title: 'Google Drive',
    description: 'Google Drive',
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Google Drive" />
    <BoxContainer>
      <Suspense>
        <GoogleDriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
    <div class="h-10"></div>
  </SectionContainer>
</template>
