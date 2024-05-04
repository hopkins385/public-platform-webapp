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
    <BoxContainer class="w-full">
      <div class="flex justify-between">
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo('/assistant/create')"
          >
            <PlusIcon class="size-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo('/assistant/manage')"
          >
            <SettingsIcon class="size-4 stroke-1.5" />
          </Button>
        </div>
      </div>
      <div class="mt-5">
        <Suspense>
          <AssistantCardGrid />
          <template #fallback> Loading ... </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
