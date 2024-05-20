<script setup lang="ts">
  /**
   * Admin Users Create
   * Route: /admin/users/create
   */
  definePageMeta({
    title: 'admin.meta.users.create.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Create User',
      label: 'Create User',
    },
  });
</script>

<template>
  <div></div>
</template>
