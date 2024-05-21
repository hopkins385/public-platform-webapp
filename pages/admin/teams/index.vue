<script setup lang="ts">
  /**
   * Admin Teams Index
   * Route: /admin/teams
   */
  definePageMeta({
    title: 'admin.meta.teams.index.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Teams',
      label: 'Teams',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Manage Teams"
      subtitle="Add, edit, and remove teams from your space"
    />
  </SectionContainer>
</template>
