<script setup lang="ts">
  const { signOut } = useAuth();
  await signOut();
</script>

<template>
  <div></div>
</template>
