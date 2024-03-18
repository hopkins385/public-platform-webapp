<script setup lang="ts"></script>

<template>
  <SectionContainer class="h-full">
    <SectionHeading title="Chat History" />
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
