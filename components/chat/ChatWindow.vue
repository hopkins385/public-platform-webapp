<script setup lang="ts">
  import { useElementVisibility, useMutationObserver } from '@vueuse/core';
  import {
    ArrowBigDownDashIcon,
    ChevronLeftIcon,
    MessageSquareXIcon,
    ShareIcon,
    SquareIcon,
  } from 'lucide-vue-next';
  import ChatSettings from './ChatSettings.vue';
  import type { ChatMessage } from '~/interfaces/chat.interfaces';

  const props = defineProps<{
    chatId?: string | null;
    assistant?: any;
    chatMessages?: ChatMessage[];
  }>();

  const inputMessage = ref('');
  const messageChunk = ref('');
  const isPending = ref(false);
  const isStreaming = ref(false);
  // const showShareDialog = ref(false);

  const chatStore = useChatStore();
  const settings = useChatSettingsStore();
  const { $client } = useNuxtApp();
  const { locale } = useI18n();
  const { render } = useMarkdown();
  const { postConversation, hasError, errorMessage, setError, clearError } =
    useChatConversation();
  const {
    messages,
    hasMessages,
    addMessage,
    getFormattedMessages,
    clearMessages,
    initMessages,
  } = useChatMessages();

  let ac: AbortController;

  const resetForm = () => {
    if (ac) {
      ac.abort();
    }
    messageChunk.value = '';
    isPending.value = false;
    isStreaming.value = false;
  };

  const onAbort = () => {
    addMessage(messageChunk.value, 'assistant');
    resetForm();
  };

  const clearChatMessages = () => {
    if (props.chatId) {
      $client.chat.clearMessages.query({ chatId: props.chatId }).catch(() => {
        setError('Ups something went wrong');
      });
    }
    clearMessages();
    resetForm();
    clearError();
  };

  const onSubmit = async () => {
    if (!inputMessage.value || isPending.value || isStreaming.value) {
      return;
    }

    if (props.chatId) {
      $client.chat.createMessage
        .query({
          chatId: props.chatId,
          chatMessage: {
            role: 'user',
            content: inputMessage.value,
          },
        })
        .catch(() => {
          setError('Ups something went wrong');
        });
    }

    clearError();
    addMessage(inputMessage.value, 'user');
    inputMessage.value = '';

    isPending.value = true;
    messageChunk.value = '';

    ac = new AbortController();
    try {
      const stream = await postConversation(ac.signal, {
        model: chatStore.model,
        lang: locale.value,
        messages: getFormattedMessages(),
        chatId: props.chatId,
      });

      isPending.value = false;

      if (!(stream instanceof ReadableStream)) {
        setError('Ups something went wrong');
        return;
      }

      const reader = stream.getReader();
      let done = false;

      isStreaming.value = true;
      while (!done) {
        const { value, done: _done } = await reader.read();
        done = _done;
        messageChunk.value += new TextDecoder().decode(value, {
          stream: true,
        });
      }
      isStreaming.value = false;

      addMessage(messageChunk.value, 'assistant');
      messageChunk.value = '';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      setError(error.message);
    }
  };

  function onKeyDownEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && settings.submitOnEnter) {
      event.preventDefault();
      onSubmit();
    }
  }

  const onPresetClick = (value: string) => {
    inputMessage.value = value;
    onSubmit();
  };

  const chatMessagesContainerRef = ref<HTMLElement | null>(null);

  const visibilityTargetRef = ref<HTMLElement | null>(null);
  const targetIsVisible = useElementVisibility(visibilityTargetRef);

  const scrollToBottom = () => {
    nextTick(() => {
      chatMessagesContainerRef.value?.scrollTo({
        top: chatMessagesContainerRef.value.scrollHeight,
        behavior: 'smooth',
      });
    });
  };

  function setModelFromAssistant() {
    if (props?.assistant?.llm) {
      const { apiName } = props.assistant?.llm;
      chatStore.model = apiName;
    }
  }

  // observer
  useMutationObserver(
    chatMessagesContainerRef,
    (mutations) => {
      mutations.forEach(() => {
        scrollToBottom();
      });
    },
    {
      childList: true,
      subtree: true,
      characterData: true,
    },
  );

  onMounted(() => {
    setModelFromAssistant();
    if (props.chatMessages && props.chatMessages.length > 0) {
      initMessages(props.chatMessages);
      scrollToBottom();
    }
  });

  const chatHeader = true;
  const chatSelector = false;
</script>

<template>
  <BoxContainer
    id="chatWrapper"
    class="relative flex size-full flex-col px-10 py-10 xl:px-20"
  >
    <div class="absolute left-0 top-1/2 -translate-y-1/2">
      <Button
        size="icon"
        variant="ghost"
        @click="() => settings.toggleSideBarOpen()"
      >
        <ChevronLeftIcon
          class="size-4 stroke-1.5"
          :class="{
            'rotate-180 transform': !settings.sideBarOpen,
          }"
        />
      </Button>
    </div>
    <div
      id="chatHeader"
      v-if="chatHeader"
      class="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-center justify-between px-8 py-5"
    >
      <div v-if="!chatSelector"></div>
      <div class="pointer-events-auto" v-if="chatSelector">
        <Suspense>
          <ChatModelSelector />
          <template #fallback> Loading... </template>
        </Suspense>
        <div>
          <AssistantDetailsActive :assistant="assistant" />
        </div>
      </div>

      <div
        class="pointer-events-auto flex items-center justify-center space-x-3"
      >
        <Button size="icon" variant="outline" @click="clearChatMessages">
          <MessageSquareXIcon class="size-4 stroke-1.5 group-hover:stroke-2" />
        </Button>
        <!--
        <ChatShareDialog v-model="showShareDialog" />
        <Button
          size="icon"
          variant="outline"
          class="group"
          @click="showShareDialog = true"
        >
          <ShareIcon class="size-4 stroke-1.5 group-hover:stroke-2" />
        </Button>
        -->
        <ChatSettings />
      </div>
    </div>
    <div
      id="chatMessagesContainer"
      ref="chatMessagesContainerRef"
      class="no-scrollbar relative grow overflow-y-scroll rounded-lg"
    >
      <ChatPresets
        v-if="!hasMessages"
        id="chatPresets"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style="width: 100%; max-width: 800px; max-height: 80%"
        @clicked="(value) => onPresetClick(value)"
      />
      <ChatMessageBox
        v-for="(message, index) in messages"
        :key="index"
        :message="render(message.content)"
        :role="message.role"
      />
      <ChatMessageBox v-if="isPending" message="..." role="assistant" />
      <ChatMessageBox
        v-if="messageChunk"
        id="chatMessage"
        :message="render(messageChunk)"
        role="assistant"
      />
      <div v-if="hasError" class="px-20 text-sm text-destructive">
        <p class="pb-2 font-semibold">Ups, something went wrong:</p>
        <p>{{ errorMessage }}</p>
      </div>
      <div class="h-10 border-0"></div>
      <!-- ref="visibilityTargetRef" -->
      <div
        v-if="!targetIsVisible && hasMessages"
        class="sticky bottom-2 right-1/2 hidden opacity-95"
        style="transform: translateX(50%)"
      >
        <Button
          variant="outline"
          size="icon"
          class="group rounded-full border bg-slate-200 shadow-md"
          @click="() => scrollToBottom()"
        >
          <ArrowBigDownDashIcon
            class="size-5 stroke-1.5 group-hover:stroke-2"
          />
        </Button>
      </div>
    </div>
    <div id="chatInputWrapper" class="relative shrink-0 pt-5">
      <form class="flex items-center space-x-2" @submit.prevent="onSubmit">
        <div class="z-10 max-h-96 w-full">
          <Textarea
            v-model="inputMessage"
            :placeholder="$t('chat.placeholder')"
            class="resize-none rounded-2xl py-3 focus:shadow-lg"
            @keydown.enter="onKeyDownEnter"
          />
        </div>
        <Button
          type="submit"
          :disabled="!inputMessage || isPending || isStreaming"
        >
          {{ $t('chat.send') }}
        </Button>
      </form>
      <Button
        v-if="isStreaming"
        variant="outline"
        size="icon"
        class="group absolute right-24 top-7 z-20 mr-1 size-8 rounded-full bg-slate-100"
        @click="() => onAbort()"
      >
        <SquareIcon class="size-3 text-slate-500 group-hover:text-slate-900" />
      </Button>
    </div>
    <div
      class="absolute bottom-3 left-0 w-full text-center text-slate-500"
      style="font-size: 0.65rem"
    >
      <p>{{ $t('chat.notification') }}</p>
    </div>
  </BoxContainer>
</template>
