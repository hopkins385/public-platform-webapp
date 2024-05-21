<script setup lang="ts">
  /**
   * Admin Teams Edit
   * Route: /admin/teams/${teamId}/edit
   */
  definePageMeta({
    title: 'admin.meta.teams.edit.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Edit Team',
      label: 'Edit Team',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Edit Team" subtitle="Update team details" />
  </SectionContainer>
</template>
