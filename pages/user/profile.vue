<script setup lang="ts">
  definePageMeta({
    title: 'user.meta.title',
  });

  const isLoading = ref(false);

  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe();
  const { signOut } = useAuth();
  const { getCheckoutUrl } = useStripe();

  const onManageSubscriptionClick = async () => {
    isLoading.value = true;
    try {
      const { data } = await getCheckoutUrl();
      if (!data.value || !data.value.url) return;
      return navigateTo(data.value.url, { external: true });
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };
</script>

<template>
  <SectionContainer class="pb-10">
    <SectionHeading
      :title="`${user?.firstName ?? ''}'s Profile`"
      subtitle="On this page you can edit your personal profile settings"
    >
      <template #button>
        <Button variant="outline" @click="signOut">Logout</Button>
      </template>
    </SectionHeading>
    <div class="grid grid-cols-4 gap-5">
      <BoxContainer class="col-span-3">
        <UserProfileForm
          :user="{
            id: user?.id ?? '',
            name: user?.name ?? '',
            email: user?.email ?? '',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
          }"
          @refresh="refresh"
        />
      </BoxContainer>
      <BoxContainer class="col-span-1 text-sm">
        <h2 class="pb-5">Security Settings</h2>
        <UserEmailVerified :verified-at="user?.emailVerifiedAt ?? null" />
      </BoxContainer>
    </div>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">Subscription</h2>
      <LoadingButton
        :is-loading="isLoading"
        variant="outline"
        @click="onManageSubscriptionClick"
      >
        Manage Subscription
      </LoadingButton>
    </BoxContainer>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">App Settings</h2>
    </BoxContainer>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">API Tokens</h2>
    </BoxContainer>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">Danger Zone</h2>
      <!-- UserDeleteAccount :id="user?.id" / -->
    </BoxContainer>
  </SectionContainer>
</template>
