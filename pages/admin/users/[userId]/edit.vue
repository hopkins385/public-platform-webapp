<script setup lang="ts">
  /**
   * Admin Users Create
   * Route: /admin/users/${userId}/edit
   */
  definePageMeta({
    title: 'admin.meta.users.edit.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Edit User',
      label: 'Edit User',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Edit User" subtitle="Update user details" />
  </SectionContainer>
</template>
