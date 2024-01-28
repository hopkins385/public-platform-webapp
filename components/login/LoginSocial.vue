<script setup lang="ts">
  const { signIn } = useAuth();
  const onSocialLogin = (provider: string) => {
    signIn(provider, { redirect: true }).catch((error) => {
      console.log(error);
    });
  };
</script>

<template>
  <div class="flex flex-col">
    <div
      class="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300"
    >
      <p class="mx-4 mb-0 text-center font-semibold">OR</p>
    </div>

    <button
      class="font-roboto flex h-10 w-full items-center justify-center rounded bg-[#4285f4] text-center text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-0"
      role="button"
      @click="onSocialLogin('google')"
    >
      <IconGoogle class="ml-1 size-8" :font-controlled="false" filled />
      <span class="flex-1">Sign in with Google</span>
    </button>
  </div>
</template>

<style scoped></style>
