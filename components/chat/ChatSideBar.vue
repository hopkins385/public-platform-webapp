<script setup lang="ts">
  import { PanelRightIcon } from 'lucide-vue-next';
  import Input from '../ui/input/Input.vue';

  const sideBarOpen = ref(true);
  const search = ref('');

  const { getChatForUser, getAllChatsForUser } = useChat();
  const { data: all } = await getAllChatsForUser({ lazy: true });

  function toggleSideBar() {
    sideBarOpen.value = !sideBarOpen.value;
  }
</script>

<template>
  <div
    class="h-full shrink-0 pb-32 transition-all ease-in-out"
    :class="{
      'w-20': !sideBarOpen,
      'w-72': sideBarOpen,
    }"
  >
    <BoxContainer class="relative h-full p-5 text-sm">
      <button
        class="absolute bottom-0 right-0 p-3 text-muted-foreground"
        @click="toggleSideBar"
      >
        <PanelRightIcon class="size-4 fill-slate-100 stroke-1.5 opacity-70" />
      </button>
      <div
        :class="{
          hidden: !sideBarOpen,
          block: sideBarOpen,
        }"
      >
        <Input
          v-model="search"
          placeholder="Search for messages..."
          class="w-full placeholder:opacity-50"
          size="sm"
          variant="outline"
        />
      </div>
      <div
        class="h-full space-y-2 overflow-y-auto pt-6 transition-opacity duration-300 ease-in-out"
        :class="{
          'opacity-0': !sideBarOpen,
          'opacity-100': sideBarOpen,
        }"
      >
        <ChatHistoryBox
          v-for="chat in all.chats"
          :key="chat.id"
          v-bind="chat"
          :active="chat.id === $route.params.chatId"
        />
      </div>
      <div
        class="absolute bottom-2 left-1/2 -translate-x-1/2"
        :class="{
          hidden: !sideBarOpen,
          block: sideBarOpen,
        }"
      >
        <NuxtLinkLocale
          to="/chat/history"
          class="text-xs text-muted-foreground opacity-60 hover:underline"
        >
          Go to full History
        </NuxtLinkLocale>
      </div>
    </BoxContainer>
  </div>
</template>
