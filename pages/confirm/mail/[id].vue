<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
    title: 'confirm.meta.title',
    auth: {
      unauthenticatedOnly: true,
      // navigateAuthenticatedTo: '/',
    },
    validate: (route) => {
      const { isValidRouteUlid } = useRouteValidation();
      return isValidRouteUlid(route.params);
    },
  });
</script>

<template>
  <div
    class="mx-auto flex h-full max-w-xl flex-col items-center justify-center"
  >
    <h1 class="text-2xl font-semibold">{{ $t('confirm.email') }}</h1>

    <Suspense>
      <ConfirmMail />
      <template #fallback> Loading... </template>
    </Suspense>
  </div>
</template>
