<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.index.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat Conversation',
      label: 'Conversation',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidChatId(route.params);
    },
  });

  const { chatId } = useRoute().params;

  const { getChatForUser } = useChat();
  const { data: chat, error } = await getChatForUser(chatId as string);

  const chatSettings = useChatSettingsStore();

  if (!chat.value) {
    await navigateTo('/404');
  }

  const editorContent = ref<string>('');
</script>

<template>
  <div class="h-full">
    <ErrorAlertStatic v-if="error" type="error" :message="error.message" />
    <div class="flex h-full">
      <!-- ChatSideBar /-->
      <ChatNewModal />
      <div class="flex w-full">
        <ChatWindow
          v-if="chat"
          :chat-id="chat?.id"
          :chat-title="chat?.title"
          :chat-messages="chat?.messages"
          :assistant="chat?.assistant"
          :class="chatSettings.sideBarOpen ? 'w-1/2' : 'w-full'"
        />
        <div :class="chatSettings.sideBarOpen ? 'w-1/2 p-10' : 'w-0'">
          <LazyEditorBox v-if="chatSettings.sideBarOpen" :model-value="editorContent" />
        </div>
      </div>
    </div>
  </div>
</template>
