<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-white">
    <Suspense>
      <ImageExploreList />
      <template #fallback>
        <p class="animate-pulse text-center text-sm opacity-50">Loading ...</p>
      </template>
    </Suspense>
  </div>
</template>
