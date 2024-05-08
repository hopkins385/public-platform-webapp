<script setup lang="ts">
  definePageMeta({
    title: 'collections.meta.update.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Update Collection',
      label: 'Update Collection',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidCollectionId(route.params);
    },
  });
</script>

<template>
  <div>Edit Collection</div>
</template>
