<script setup lang="ts">
  definePageMeta({
    title: 'One Drive',
    description: 'One Drive',
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="One Drive" />
    <BoxContainer>
      <Suspense>
        <OnedriveTable />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
  </SectionContainer>
</template>
