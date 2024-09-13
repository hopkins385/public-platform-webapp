<script setup lang="ts">
  const { data: auth } = useAuth();
  const user = computed(() => auth.value?.user);

  const { onboardUser } = useOnboarding();

  const orgName = ref('');
  function onSubmit() {
    onboardUser({ orgName: orgName.value })
      .then(() => {
        //
      })
      .catch((error) => {
        console.error(error);
      });
  }
</script>

<template>
  <div>{{ user?.name }}</div>
  <div>He Wo</div>
  <div>
    <form @submit.prevent="onSubmit">
      <input v-model="orgName" type="text" />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
