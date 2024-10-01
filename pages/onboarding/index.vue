<script setup lang="ts">
  /**
   * Onboarding
   * Route: /onboarding
   */

  definePageMeta({
    layout: 'onboarding',
    title: 'onboarding.meta.title',
  });
  const { data: auth, getSession } = useAuth();
  const user = computed(() => auth.value?.user);

  const { onboardUser } = useOnboarding();
  const { getAllProjects } = useManageProjects();

  const orgName = ref('');
  const isLoading = ref(false);

  const projectStore = useProjectStore();

  async function initProjectStore() {
    const { data: projects, error } = await getAllProjects();
    if (error.value || !projects.value || projects.value.length < 1) {
      return;
    }
    const { id } = projects.value[0]; // TODO: projectId validation
    projectStore.setActiveProjectId(id);
  }

  function onSubmit() {
    isLoading.value = true;
    onboardUser({ orgName: orgName.value })
      .then(async () => {
        // refresh session
        await getSession();
        // init store with first project
        await initProjectStore();
        // navigate to user profile
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
