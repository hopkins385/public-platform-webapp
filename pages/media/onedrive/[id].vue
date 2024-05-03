<script setup lang="ts">
  definePageMeta({
    title: 'One Drive',
    description: 'One Drive',
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
  <SectionContainerWithImage>
    <BoxContainer>
      <Suspense>
        <OnedriveTable :id="$route.params?.id" />
        <template #fallback>
          <TableSkeleton />
        </template>
      </Suspense>
    </BoxContainer>
  </SectionContainerWithImage>
</template>
