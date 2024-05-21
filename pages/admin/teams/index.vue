<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

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

  const { setSearch, search } = useAdminTeams();
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Manage Teams"
      subtitle="Add, edit, and remove teams from your space"
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
              placeholder="Search teams..."
            />
          </div>
          <div class="shrink-0">
            <LinkButton to="/admin/teams/create">
              New Team
              <PlusIcon class="ml-2 size-4 stroke-2" />
            </LinkButton>
          </div>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <div>
        <Suspense>
          <AdminTeamsTable />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
