<script setup lang="ts">
  /**
   * Admin Users
   * Route: /admin
   */
  definePageMeta({
    title: 'admin.meta.index.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Admin',
      label: 'Admin',
    },
  });
</script>

<template>
  <div></div>
</template>
