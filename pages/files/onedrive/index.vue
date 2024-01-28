<script setup lang="ts">
  definePageMeta({
    title: 'One Drive',
    description: 'One Drive',
  });
</script>

<template>
  <SectionContainerWithImage>
    <BoxContainer>
      <Suspense>
        <OnedriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
  </SectionContainerWithImage>
</template>
