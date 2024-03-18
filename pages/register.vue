<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
    title: 'register.meta.title',
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/',
    },
  });
</script>

<template>
  <div>
    <RegisterView />
  </div>
</template>
