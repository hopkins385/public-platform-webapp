<script setup lang="ts">
  definePageMeta({
    title: 'Google Drive',
    description: 'Google Drive',
  });
</script>

<template>
  <SectionContainerWithImage>
    <BoxContainer>
      <Suspense>
        <GoogleDriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
    <div class="h-10"></div>
  </SectionContainerWithImage>
</template>
