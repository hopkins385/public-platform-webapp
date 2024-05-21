<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

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

  const { getUsersAllPaginated, setPage, setSearch, search } = useAdminUsers();
  const { data: users } = await getUsersAllPaginated();
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Manage Users"
      subtitle="Add, edit, and remove users from your space"
    />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex h-24 w-full items-end justify-between space-x-4 p-2">
          <!-- div> filter tbd </!-->
          <div class="w-full">
            <Input
              :model-value="search"
              @update:model-value="(val) => setSearch(val)"
              placeholder="Search users..."
            />
          </div>
          <div class="shrink-0">
            <LinkButton to="/admin/users/create">
              New User
              <PlusIcon class="ml-2 size-4 stroke-2" />
            </LinkButton>
          </div>
        </div>
      </template>
    </Heading>
    <div>
      {{ users }}
    </div>
  </SectionContainer>
</template>
