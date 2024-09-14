<script setup lang="ts">
  /**
   * Onboarding
   * Route: /onboarding
   */

  definePageMeta({
    layout: 'onboarding',
    title: 'onboarding.meta.title',
  });
  const { data: auth } = useAuth();
  const user = computed(() => auth.value?.user);

  const { onboardUser } = useOnboarding();

  const orgName = ref('');
  const isLoading = ref(false);

  function onSubmit() {
    isLoading.value = true;
    onboardUser({ orgName: orgName.value })
      .then(async () => {
        await navigateTo('/user/profile');
      })
      .catch((error) => console.error(error))
      .finally(() => (isLoading.value = false));
  }
</script>

<template>
  <div class="flex justify-center">
    <div class="space-y-2 p-10">
      <div>Hello, {{ user?.name }}</div>
      <div>Please enter your organisation name:</div>
      <div>
        <form class="space-y-2" @submit.prevent="onSubmit">
          <Input v-model="orgName" type="text" />
          <LoadingButton :is-loading="isLoading" type="submit">Submit</LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>
