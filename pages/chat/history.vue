<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.history.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat History',
      label: 'Chat History',
    },
  });
</script>

<template>
  <SectionContainer class="h-full">
    <SectionHeading
      title="Chat History"
      subtitle="Here you can see all your recent chats"
    />
    <Suspense>
      <ChatHistory />
      <template #fallback>
        <BoxContainer>
          <TableSkeleton />
        </BoxContainer>
      </template>
    </Suspense>
  </SectionContainer>
</template>
