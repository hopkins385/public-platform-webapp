<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
    title: 'auth.meta.title',
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/',
    },
  });

  const isLoading = ref(false);

  const { signIn } = useAuth();

  async function onSubmit() {
    isLoading.value = true;
    signIn('auth0', {
      redirect: true,
      redirectUrl: '/',
    })
      .then(() => {
        // Redirect to the home page
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  onMounted(async () => await onSubmit());
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center space-y-4 p-10 lg:px-28">
    <h2 class="text-2xl font-bold">{{ $t('auth.login') }}</h2>

    <LoadingButton :is-loading="isLoading" type="submit" class="w-full" @click="onSubmit">
      {{ $t('Continue to Login') }}
    </LoadingButton>
  </div>
</template>
