<script setup lang="ts">
  const { signOut } = useAuth();
  await signOut({
    redirect: true,
    callbackUrl: '/login',
  });
</script>

<template>
  <div></div>
</template>
