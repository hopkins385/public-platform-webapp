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
  <SectionContainer>
    <SectionHeading
      title="Space Manager"
      subtitle="Manage your teams, users, and settings"
    />
    <div class="flex space-x-4">
      <NuxtLinkLocale to="/admin/users">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Manage Users</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/admin/teams">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Manage Teams</div>
        </BoxContainer>
      </NuxtLinkLocale>
    </div>
  </SectionContainer>
</template>
