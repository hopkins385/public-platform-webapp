<script setup lang="ts">
  import { useWebSocket } from '@vueuse/core';

  const message = ref('');
  const url = 'ws://localhost:3000/_ws';
  const { status, data, send, open, close } = useWebSocket(url);
</script>

<template>
  <div>Status {{ status }}</div>
  <div>Data: {{ data }}</div>
  <button @click="() => open()">Open</button>
  <button @click="() => close()">Close</button>
  <div>
    <input v-model="message" />
    <button @click="send(message)">Send</button>
  </div>
</template>
