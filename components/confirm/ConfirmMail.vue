<script setup lang="ts">
  const route = useRoute();
  const { confirmEmail } = useRegister();

  const { data, error } = await confirmEmail({
    userId: route.params?.id as string,
    token: route.query?.token as string,
  });
  if (error.value) {
    console.error('[CM]', error.value.message);
    // navigateTo('/404');
  }
  if (data.value?.success === true) {
    navigateTo('/confirm/mail/success');
  }
</script>

<template>
  <div class="text-center">
    <p v-if="data?.success === true" class="pb-4 text-green-700">
      {{ $t('Success') }}
    </p>
    <p v-else-if="error" class="pb-4 text-destructive">
      Ups, we haven't been able to confirm your email.<br />Please contact our
      support.
    </p>
    <NuxtLink to="/" class="underline">{{ $t('Go to Homepage') }}</NuxtLink>
  </div>
</template>
