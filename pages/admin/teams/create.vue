<script setup lang="ts">
  /**
   * Admin Teams Create
   * Route: /admin/teams/create
   */
  definePageMeta({
    title: 'admin.meta.teams.create.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Create Team',
      label: 'Create Team',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Create Team"
      subtitle="Add a new team to your space"
    />
  </SectionContainer>
</template>
