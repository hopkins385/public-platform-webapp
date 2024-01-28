<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
    title: 'auth.meta.title',
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/',
    },
  });
</script>

<template>
  <div>
    <LoginView />
  </div>
</template>
