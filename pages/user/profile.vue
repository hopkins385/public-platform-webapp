<script setup lang="ts">
  definePageMeta({
    title: 'user.meta.title',
  });

  const isLoading = ref(false);

  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe();
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
        <Button variant="outline" @click="navigateTo('/logout')">Logout</Button>
      </template>
    </SectionHeading>
    <div class="grid grid-cols-4 gap-5">
      <BoxContainer class="col-span-3">
        <UserProfileForm
          :user="{
            id: user?.id ?? '',
            name: user?.name ?? '',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
          }"
          @refresh="refresh"
        />
      </BoxContainer>
      <BoxContainer class="col-span-1 space-y-6 text-sm">
        <div>
          <h2 class="pb-5 font-semibold">Account Security</h2>
          <UserEmailVerified :verified-at="user?.emailVerifiedAt ?? null" />
        </div>
        <div>
          <h2 class="pb-5">Credits</h2>
          <p>{{ user?.credit[0]?.amount }}</p>
        </div>
      </BoxContainer>
    </div>
    <BoxContainer class="mt-5">
      <UserEditLoginForm
        :user="{
          id: user?.id ?? '',
          email: user?.email ?? '',
        }"
      />
    </BoxContainer>
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
