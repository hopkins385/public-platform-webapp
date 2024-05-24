<script setup lang="ts">
  import { useDropZone, useMutationObserver } from '@vueuse/core';
  import {
    ChevronLeftIcon,
    MessageSquareTextIcon,
    MessageSquareXIcon,
    PaperclipIcon,
    SendIcon,
    SquareIcon,
  } from 'lucide-vue-next';
  import ChatSettings from './ChatSettings.vue';
  import type { ChatMessage, ChatImage } from '~/interfaces/chat.interfaces';

  const allowedFileMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  const props = defineProps<{
    chatId: string;
    assistant?: any;
    chatMessages?: ChatMessage[];
  }>();

  const inputMessage = ref<any>('');
  const messageChunk = ref('');
  const isPending = ref(false);
  const isStreaming = ref(false);
  // const showShareDialog = ref(false);

  const chatStore = useChatStore();
  const settings = useChatSettingsStore();
  const { $client } = useNuxtApp();
  const { locale } = useI18n();
  const { postConversation, hasError, errorMessage, setError, clearError } = useChatConversation();
  const { messages, hasMessages, addMessageToChat, getFormattedMessages, clearMessages, initMessages } =
    useChatMessages();

  const chatMessagesContainerRef = ref<HTMLElement | null>(null);
  const chatBoxContainerRef = ref<HTMLElement | null>(null);

  const inputImages = ref<ChatImage[]>([]);

  let ac: AbortController;

  function resetForm() {
    if (ac) {
      ac.abort();
    }
    messageChunk.value = '';
    isPending.value = false;
    isStreaming.value = false;
  }

  function onAbort() {
    addMessageToChat({
      type: 'text',
      role: 'assistant',
      content: messageChunk.value,
    });
    resetForm();
  }

  function clearChatMessages() {
    if (props.chatId) {
      $client.chat.clearMessages.query({ chatId: props.chatId }).catch(() => {
        setError('Ups something went wrong');
      });
    }
    clearMessages();
    resetForm();
    clearError();
  }

  function getVisionContent(images: ChatImage[]): any {
    return images.map((image) => {
      if (image.status !== 'loaded') return;
      return {
        type: 'image',
        url: image.src,
      };
    });
  }

  function clearVisionContent() {
    inputImages.value = [];
  }

  // TODO: REFACTOR ME!!!
  async function onSubmit() {
    if (!inputMessage.value || isPending.value || isStreaming.value) {
      return;
    }

    const hasImages = inputImages.value.some((image) => image.status === 'loaded');
    const msgType = hasImages ? 'image' : 'text';
    const visionContent = getVisionContent(inputImages.value);

    clearError();
    clearVisionContent();

    // add user message to chat
    addMessageToChat({
      type: msgType,
      role: 'user',
      content: inputMessage.value,
      visionContent,
    });

    // clear input
    inputMessage.value = '';

    // send message to assistant
    isPending.value = true;
    messageChunk.value = '';

    ac = new AbortController();
    try {
      const stream = await postConversation(ac.signal, {
        model: chatStore.model,
        provider: chatStore.provider,
        lang: locale.value,
        messages: getFormattedMessages(),
        chatId: props.chatId,
      });

      isPending.value = false;

      if (!(stream instanceof ReadableStream)) {
        setError('Invalid response from server');
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

      addMessageToChat({
        type: 'text',
        role: 'assistant',
        content: messageChunk.value,
      });
      messageChunk.value = '';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('[stream assistant] ', error);
      setError('Cannot process message');
    }
  }

  function onKeyDownEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && settings.submitOnEnter) {
      event.preventDefault();
      onSubmit();
    }
  }

  function onPresetClick(value: string) {
    inputMessage.value = value;
    onSubmit();
  }

  function scrollToBottom(options: { instant: boolean } = { instant: false }) {
    nextTick(() => {
      chatMessagesContainerRef.value?.scrollTo({
        top: chatMessagesContainerRef.value.scrollHeight,
        behavior: options.instant ? 'instant' : 'smooth',
      });
    });
  }

  function setModelFromAssistant() {
    if (!props.assistant) return;
    const { apiName, provider, multiModal } = props.assistant.llm;
    chatStore.setModel({
      model: apiName,
      provider: provider,
      hasVision: multiModal,
    });
  }

  const { uploadManyFiles } = useManageMedia();

  // Vision
  function addInputImage(image: ChatImage): number | null {
    const count = inputImages.value.length;
    if (count >= 5) {
      return null;
    }
    inputImages.value = [...inputImages.value, image];
    const index = inputImages.value.length - 1;
    return index;
  }

  function updateInputImage(index: number, image: ChatImage) {
    inputImages.value = inputImages.value.map((img, i) => (i === index ? image : img));
  }

  async function onFileReaderLoad(imageSrc: string, file: File) {
    const index = addInputImage({ src: imageSrc, status: 'loading' });
    if (index === null) {
      return;
    }
    const isVisonEnabled = chatStore.modelWithVision;
    const uploadedImages = await uploadManyFiles([file], isVisonEnabled);
    if (!uploadedImages || uploadedImages.length === 0) {
      updateInputImage(index, { src: imageSrc, status: 'error' });
      return;
    }
    const uploadedImage = uploadedImages[0];
    updateInputImage(index, { src: uploadedImage.path, status: 'loaded' });
  }

  function readFile(file: File | null | undefined) {
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type', file.type);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const imageSrc = reader.result as string;
      await onFileReaderLoad(imageSrc, file);
    };
    reader.readAsDataURL(file);
  }

  function openFileDialog() {
    if (!chatStore.modelWithVision) return;
    const accept = Array.isArray(allowedFileMimeTypes) ? allowedFileMimeTypes.join(',') : allowedFileMimeTypes;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = false;
    input.onchange = () => {
      const file = input.files?.[0];
      readFile(file);
    };
    input.click();
  }

  const { isOverDropZone } = useDropZone(chatBoxContainerRef, {
    onDrop: (files) => {
      if (!chatStore.modelWithVision) return;
      const file = files?.[0];
      readFile(file);
    },
    dataTypes: allowedFileMimeTypes,
  });

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
      scrollToBottom({ instant: true });
    }
  });
</script>

<template>
  <BoxContainer
    ref="chatBoxContainerRef"
    id="chatWrapper"
    class="relative flex size-full flex-col border-0 px-10 pb-10 pt-20 md:px-20 2xl:px-40"
  >
    <!-- toggle sidebar -->
    <div class="absolute left-0 top-1/2 -translate-y-1/2">
      <Button size="icon" variant="ghost" @click="() => settings.toggleSideBarOpen()">
        <ChevronLeftIcon
          class="size-4 stroke-1.5"
          :class="{
            'rotate-180 transform': !settings.sideBarOpen,
          }"
        />
      </Button>
    </div>
    <!-- chat header -->
    <div id="chatHeader" class="pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-between px-8 py-5">
      <!-- chat model selector -->
      <div class="pointer-events-auto flex items-center space-x-4 text-muted-foreground">
        <Suspense>
          <ChatModelSelector />
          <template #fallback> Loading... </template>
        </Suspense>
      </div>
      <!-- active assistant -->
      <div class="flex shrink items-center 2xl:pr-8">
        <AssistantDetailsActive :key="assistant?.id" :assistant="assistant" />
      </div>

      <div class="pointer-events-auto flex shrink-0 space-x-3">
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
        <div>
          <Button variant="outline" size="icon" @click="settings.newChatModalOpen = true">
            <MessageSquareTextIcon class="size-4 stroke-1.5 group-hover:stroke-2" />
          </Button>
        </div>
      </div>
    </div>
    <!-- chat messages container -->
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
      <!-- chat messages -->
      <ChatMessageBox
        v-for="(message, index) in messages"
        :key="index"
        :type="message.type"
        :content="message.content"
        :vision-contents="message.visionContent"
        :display-name="message.role === 'user' ? $t('user.placeholder') : assistant?.title"
      />
      <!-- pending message -->
      <ChatMessageBox v-if="isPending" type="text" :display-name="assistant?.title" content="..." />
      <!-- streaming message -->
      <ChatMessageChunk
        v-if="messageChunk.length > 0"
        id="chatMessage"
        :chunk="messageChunk"
        :assistant-name="assistant?.title"
      />
      <!-- error message -->
      <div v-if="hasError" class="px-20 text-sm text-destructive">
        <p class="pb-2 font-semibold">Ups, something went wrong:</p>
        <p>{{ errorMessage }}</p>
      </div>
      <div class="h-10 border-0"></div>
      <!-- scroll to bottom button -->
      <!-- div
        v-if="hasMessages"
        class="sticky bottom-2 right-1/2 opacity-95"
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
      </!-->
    </div>
    <!-- Input wrapper -->
    <div id="chatInputWrapper" class="relative shrink-0 pt-5">
      <!-- Image input -->
      <ChatImageInput v-model:input-images="inputImages" />
      <div class="flex space-x-1">
        <!-- vision input -->
        <div v-if="chatStore.modelWithVision">
          <Button
            variant="ghost"
            size="icon"
            class="group text-slate-500"
            :class="{
              'bg-slate-100 text-green-600': isOverDropZone,
            }"
            @click="() => openFileDialog()"
          >
            <PaperclipIcon
              class="size-5 -rotate-45 stroke-1 group-hover:stroke-1.5"
              :class="{ 'stroke-2': isOverDropZone }"
            />
          </Button>
        </div>
        <!-- message input form -->
        <form class="relative flex w-full items-center space-x-2 border-0" @submit.prevent="onSubmit">
          <div class="relative z-10 max-h-96 w-full">
            <Textarea
              v-model="inputMessage"
              :placeholder="$t('chat.placeholder')"
              class="resize-none rounded-2xl py-3 pr-14 focus:shadow-lg"
              @keydown.enter="onKeyDownEnter"
            />
          </div>
          <Button
            class="absolute bottom-1 right-2 z-10"
            type="submit"
            size="icon"
            variant="ghost"
            :disabled="!inputMessage || isPending || isStreaming"
          >
            <SendIcon class="size-5 stroke-1.5" />
          </Button>
          <Button
            v-if="isStreaming"
            variant="outline"
            size="icon"
            class="group absolute right-2 top-1 z-20 mr-1 size-8 rounded-full bg-slate-100"
            @click="() => onAbort()"
          >
            <SquareIcon class="size-3 text-slate-500 group-hover:text-slate-900" />
          </Button>
        </form>
        <div class="w-10"></div>
      </div>
    </div>
    <!-- Notification -->
    <div class="absolute bottom-3 left-0 w-full text-center text-slate-500" style="font-size: 0.65rem">
      <p>{{ $t('chat.notification') }}</p>
    </div>
  </BoxContainer>
</template>
