<script setup lang="ts">
  import { z } from 'zod';
  definePageMeta({
    validate: (route) => {
      // id is a ulid e.g 01hs0wxy2bfts50e3tp4xvdtv5
      const ulidRegex = new RegExp('^[0-7][0-9a-hjkmnp-tv-z]{24}');
      const idSchema = z.object({
        id: z.string().min(26).max(26).regex(ulidRegex),
      });
      const res = idSchema.safeParse(route.params);
      return res.success;
    },
  });

  const { $client } = useNuxtApp();
  const route = useRoute();
  const chat = await $client.chat.forUser.query({
    chatId: route.params?.id,
  });
  if (!chat || !chat.id) {
    navigateTo('/404');
  }
</script>

<template>
  <SectionContainerWithImage>
    <ChatWindow :chat-id="chat?.id" :chat-messages="chat?.messages" />
  </SectionContainerWithImage>
</template>
