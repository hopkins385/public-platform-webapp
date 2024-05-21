<script setup lang="ts">
  /**
   * Admin Users
   * Route: /admin/users
   */
  definePageMeta({
    title: 'admin.meta.users.index.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Users',
      label: 'Users',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Manage Users"
      subtitle="Add, edit, and remove users from your space"
    />
  </SectionContainer>
</template>
