<script setup lang="ts">
  import { PlusIcon, SettingsIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'assistant.meta.index.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Assistants',
      label: 'Assistants',
    },
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Assistants"
      subtitle="Start a new chat, change behavior, or delete an assistant"
    />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="ml-auto flex flex-col space-y-1 self-end px-3 pb-2 pt-14">
          <LinkButton to="/assistants/create">
            New Assistant
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </LinkButton>
        </div>
      </template>
    </Heading>

    <BoxContainer>
      <div>
        <Suspense>
          <AssistantAllTable />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
