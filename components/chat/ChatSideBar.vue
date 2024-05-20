<script setup lang="ts">
  const settings = useChatSettingsStore();

  const { getAllChatsForUser } = useChat();
  const { data: all, refresh } = await getAllChatsForUser({
    lazy: true,
    immediate: settings.sideBarOpen,
  });

  watch(
    () => settings.sideBarOpen,
    (value) => {
      if (value) {
        refresh();
      }
    },
  );
</script>

<template>
  <div
    class="flex h-full shrink-0 flex-col space-y-4 transition-all ease-in-out"
    :class="{
      'w-0': !settings.sideBarOpen,
      'w-72': settings.sideBarOpen,
    }"
  >
    <BoxContainer
      class="relative flex h-20 items-center justify-between p-5 text-sm"
      :class="{
        hidden: !settings.sideBarOpen,
        block: settings.sideBarOpen,
      }"
    >
      <div></div>
      <ChatNewModal :hide="!settings.sideBarOpen" />
    </BoxContainer>
    <BoxContainer
      class="relative grow p-5 text-sm"
      :class="{
        hidden: !settings.sideBarOpen,
        block: settings.sideBarOpen,
      }"
    >
      <!-- button
        class="absolute bottom-0 right-0 p-3 text-muted-foreground"
        @click="() => settings.toggleSideBarOpen()"
      >
        <PanelRightIcon class="size-4 fill-slate-100 stroke-1.5 opacity-70" />
      </!-->
      <div>
        <!-- Input
          v-model="search"
          placeholder="Search for messages..."
          class="w-full placeholder:opacity-50"
          variant="outline"
        /-->
      </div>
      <div
        class="h-full space-y-2 overflow-y-auto pt-6 transition-opacity duration-300 ease-in-out"
        :class="{
          'opacity-0': !settings.sideBarOpen,
          'opacity-100': settings.sideBarOpen,
        }"
      >
        <ChatHistoryBox
          v-for="chat in all?.chats || []"
          :key="chat?.id"
          v-bind="chat"
          :active="chat?.id === $route.params.chatId"
        />
      </div>
      <div
        class="absolute bottom-2 left-1/2 -translate-x-1/2"
        :class="{
          hidden: !settings.sideBarOpen,
          block: settings.sideBarOpen,
        }"
      >
        <NuxtLinkLocale
          to="/chats/history"
          class="text-xs text-muted-foreground opacity-60 hover:underline"
        >
          Go to full History
        </NuxtLinkLocale>
      </div>
    </BoxContainer>
  </div>
</template>
