<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'assistant.meta.index.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Assistants',
      label: 'Assistants',
    },
  });

  const search = ref('');
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Assistants" subtitle="Start a new chat, change behavior, or delete an assistant" />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="flex w-full justify-between space-x-4 px-3 pb-2 pt-14">
          <div class="w-full">
            <Input v-model="search" placeholder="Search assistant title ..." />
          </div>
          <div class="whitespace-nowrap">
            <LinkButton to="/assistants/create">
              New Assistant
              <PlusIcon class="ml-2 size-4 stroke-2" />
            </LinkButton>
          </div>
        </div>
      </template>
    </Heading>

    <BoxContainer>
      <div>
        <Suspense>
          <AssistantAllTable :search="search" />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
