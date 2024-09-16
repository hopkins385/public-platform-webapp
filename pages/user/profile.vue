<script setup lang="ts">
  definePageMeta({
    title: 'user.meta.title',
    breadcrumb: {
      icon: 'user',
      ariaLabel: 'User Profile',
      label: 'Profile',
    },
  });

  const isLoading = ref(false);

  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe();
  const { getCheckoutUrl } = useStripe();

  const team = computed(() => {
    if (!user.value?.teams) return null;
    return {
      name: user.value.teams[0]?.team.name,
    };
  });

  const org = computed(() => {
    if (!user.value?.teams) return null;
    return {
      name: user.value.teams[0]?.team.organisation.name ?? '',
      id: user.value.teams[0]?.team.organisation.id ?? '',
    };
  });

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

  const { data: auth } = useAuth();
</script>

<template>
  <SectionContainer>
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
      <div class="col-span-1 grid grid-cols-1 space-y-6 text-sm">
        <BoxContainer>
          <h2 class="pb-5 font-semibold">Account Security</h2>
          <UserEmailVerified :verified-at="user?.emailVerified ?? null" />
        </BoxContainer>
        <BoxContainer>
          <h2 class="pb-2 font-semibold">Plan</h2>
          <p>Preview</p>
          <h2 class="mt-2 py-2 font-semibold">Credits</h2>
          <p>{{ user?.credit[0]?.amount }} / 1000</p>
        </BoxContainer>
      </div>
    </div>
    <BoxContainer class="mt-5">
      <UserEditLoginForm
        :user="{
          id: user?.id ?? '',
          email: user?.email ?? '',
        }"
      />
    </BoxContainer>
    <div class="grid grid-cols-2 gap-5">
      <BoxContainer class="mt-5">
        <h2 class="pb-5">Organization</h2>
        <p class="w-fit text-sm">{{ org?.name }}</p>
        <p class="mt-4 w-fit text-sm opacity-50">ID: org_{{ org?.id }}</p>
      </BoxContainer>
      <BoxContainer class="mt-5">
        <h2 class="pb-5">Team</h2>
        <p class="w-fit text-sm">{{ team?.name }}</p>
      </BoxContainer>
    </div>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">Subscription</h2>
      <LoadingButton :is-loading="isLoading" variant="outline" @click="onManageSubscriptionClick">
        Manage Subscription
      </LoadingButton>
    </BoxContainer>
    <!--
    <BoxContainer class="mt-5">
      <h2 class="pb-5">App Settings</h2>
      <p class="text-sm text-muted-foreground">coming soon</p>
    </BoxContainer>
    <BoxContainer class="mt-5">
      <h2 class="pb-5">API Tokens</h2>
      <p class="text-sm text-muted-foreground">coming soon</p>
    </BoxContainer>
    -->
    <BoxContainer class="mt-5">
      <h2 class="pb-5">Danger Zone</h2>
      <UserDeleteAccount :user-id="user?.id" />
    </BoxContainer>
  </SectionContainer>
</template>
