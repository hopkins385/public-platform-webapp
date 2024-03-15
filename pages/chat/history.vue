<script setup lang="ts">
  const { $client } = useNuxtApp();
  const chats = await $client.chat.allForUser.query();
</script>

<template>
  <div>history</div>
  <div>{{ chats }}</div>
  <div>
    <div
      v-for="chat in chats"
      :key="chat.id"
      @click="() => navigateTo(`/chat/${chat.id}`)"
    >
      {{ chat.title }}
    </div>
  </div>
</template>
