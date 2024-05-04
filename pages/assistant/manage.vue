<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'assistant.meta.all.title',
    breadcrumb: {
      icon: 'users',
      ariaLabel: 'Assistant Management',
      label: 'Manage',
    },
  });
</script>

<template>
  <SectionContainer class="h-full">
    <SectionHeading title="Assistant Management">
      <template #button>
        <Button
          class="group"
          variant="outline"
          size="icon"
          @click="navigateTo('/assistant/create')"
        >
          <PlusIcon class="size-4 text-slate-500 group-hover:text-slate-900" />
        </Button>
      </template>
    </SectionHeading>
    <div>
      <AdminAssistantList />
    </div>
  </SectionContainer>
</template>
