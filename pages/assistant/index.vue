<script setup lang="ts">
  import { PlusIcon, SettingsIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'assistant.meta.title',
  });
</script>

<template>
  <SectionContainerWithImage>
    <BoxContainer class="w-full">
      <div class="flex justify-between">
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo('/admin/assistant/create')"
          >
            <PlusIcon class="size-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            size="icon"
            @click="navigateTo('/admin/assistant')"
          >
            <SettingsIcon class="size-4 stroke-1.5" />
          </Button>
        </div>
      </div>
      <div class="mt-5">
        <Suspense>
          <AssistantCardList />
          <template #fallback>
            <TableSkeleton />
          </template>
        </Suspense>
      </div>
    </BoxContainer>
  </SectionContainerWithImage>
</template>
