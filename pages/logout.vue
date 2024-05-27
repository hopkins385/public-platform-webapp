<script setup lang="ts">
  const { data: auth, signOut } = useAuth();
  await signOut({
    redirect: true,
    callbackUrl: '/login',
  });

  const socket = useWebsocketGlobal();
  socket.emit('leave', `user:${auth.value?.user.id}`);
</script>

<template>
  <div></div>
</template>
