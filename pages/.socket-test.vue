<script setup lang="ts">
  const { $socket } = useNuxtApp();
  const { data } = useAuth();
  $socket.connect();

  $socket.on('connect', () => {
    console.log('socket connected');
    // join room
    $socket.emit(SocketEvent.join, data.value?.user?.id);
    console.log('join room');
  });
</script>

<template>
  <div></div>
</template>
