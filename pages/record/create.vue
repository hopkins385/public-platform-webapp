<script setup lang="ts">
  /**
   * Records Create - Create a new record
   * Route: /record
   */

  definePageMeta({
    title: 'records.meta.index.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Create Record',
      label: 'Create Record',
    },
  });

  const { collectionId } = useRoute().query;
</script>

<template>
  <div>Create</div>
  <div>{{ collectionId }}</div>
</template>
