<script setup lang="ts">
  import { useDropZone, useEventListener, useMutationObserver, useScroll } from '@vueuse/core';
  import {
    MessageSquareTextIcon,
    PaperclipIcon,
    SendIcon,
    SquareIcon,
    SquareSplitHorizontalIcon,
  } from 'lucide-vue-next';
  import ChatSettings from './ChatSettings.vue';
  import type { ChatMessage, ChatImage } from '~/interfaces/chat.interfaces';
  import type { ToolInfoData } from '~/interfaces/tool.interfaces';

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

  const socket = useWebsocketGlobal();
  const chatStore = useChatStore();
  const settings = useChatSettingsStore();
  const { $client } = useNuxtApp();
  const { locale } = useI18n();
  const { postConversation, hasError, errorMessage, setError, clearError } = useChatConversation();
  const { messages, hasMessages, addMessageToChat, getFormattedMessages, clearMessages, initMessages } =
    useChatMessages();

  const chatMessagesContainerRef = ref<HTMLElement | null>(null);
  const chatBoxContainerRef = ref<HTMLDivElement | null>(null);
  const chatInputFormRef = ref<HTMLFormElement | null>(null);

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
    clearActiveTools();
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
    nextTick(() => {
      adjustTextareaHeight();
    });

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
      const decoder = new TextDecoder();

      let done = false;
      isStreaming.value = true;

      while (!done) {
        const { value, done: _done } = await reader.read();
        done = _done;
        messageChunk.value += decoder.decode(value, {
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

  /**
   * Aborts the ongoing chat request / chat stream
   */
  function abortChatRequest() {
    if (ac) {
      ac.abort();
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

  /**
   * Sets the llm model associated with assistant if props.assistant is defined
   */
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

  const autoScrollLocked = ref(false);
  const { arrivedState } = useScroll(chatMessagesContainerRef);

  // observer
  useMutationObserver(
    chatMessagesContainerRef,
    (mutations) => {
      if (!autoScrollLocked.value && mutations.length > 0) scrollToBottom();
    },
    {
      childList: true,
      subtree: true,
      characterData: true,
    },
  );

  useEventListener(
    chatMessagesContainerRef,
    'wheel',
    () => {
      // Disable auto-scroll when the user scrolls up and re-enable it when back at the bottom
      if (arrivedState.bottom) {
        autoScrollLocked.value = false;
        return;
      }
      autoScrollLocked.value = true;
    },
    {
      passive: true,
    },
  );

  const activeTools = ref<ToolInfoData[]>([]);

  function setActiveTool(toolInfoData: ToolInfoData) {
    activeTools.value.push(toolInfoData);
  }

  function unsetActiveTool(toolName: string) {
    activeTools.value = activeTools.value.filter((data) => data.toolName !== toolName);
  }

  function clearActiveTools() {
    activeTools.value = [];
  }

  /**
   * Adjusts the height of the textarea based on its content.
   */
  function adjustTextareaHeight() {
    const maxHeight = 364;
    const textarea = chatInputFormRef.value?.querySelector('textarea');
    if (textarea) {
      // Reset height to auto to calculate the new height
      textarea.style.height = 'auto';
      // Set the height to match the scrollHeight
      textarea.style.height = `${Math.min(maxHeight, textarea.scrollHeight)}px`;
    }
  }

  const route = useRoute();

  // abort ongoing request when route changes
  watch(
    () => route.path,
    () => abortChatRequest(),
  );

  onMounted(() => {
    adjustTextareaHeight();
    setModelFromAssistant();
    if (props.chatMessages && props.chatMessages.length > 0) {
      initMessages(props.chatMessages);
      scrollToBottom({ instant: true });
    }
    socket.on(`chat-${props.chatId}-tool-start-event`, (data: ToolInfoData) => setActiveTool(data));
    socket.on(`chat-${props.chatId}-tool-end-event`, (toolName) => unsetActiveTool(toolName));
  });

  onBeforeUnmount(() => {
    abortChatRequest();
    socket.off(`chat-${props.chatId}-tool-start-event`, (d) => setActiveTool(d));
    socket.off(`chat-${props.chatId}-tool-end-event`, (toolName) => unsetActiveTool(toolName));
  });
</script>

<template>
  <BoxContainer
    id="chatWrapper"
    ref="chatBoxContainerRef"
    class="relative flex size-full flex-col border-0 px-10 pb-10 pt-20"
    :class="{
      'md:px-20 2xl:px-40': !settings.sideBarOpen,
    }"
  >
    <!-- chat header -->
    <div id="chatHeader" class="pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-between px-8 py-5">
      <!-- chat model selector -->
      <div class="pointer-events-auto flex items-center space-x-4 text-muted-foreground">
        <ChatModelSelector />
      </div>
      <!-- active assistant -->
      <div class="flex shrink items-center 2xl:pr-8">
        <AssistantDetailsActive :key="assistant?.id" :assistant="assistant" />
      </div>
      <!-- chat actions -->
      <div class="pointer-events-auto flex shrink-0 space-x-3">
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger :as-child="true">
              <Button variant="outline" size="icon" class="group" @click="settings.newChatModalOpen = true">
                <MessageSquareTextIcon class="size-4 stroke-1.5 group-hover:stroke-2" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-sm">New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ChatSettings :assistant-id="assistant?.id" @delete-all-messages="clearChatMessages" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger :as-child="true">
              <Button variant="outline" size="icon" class="group" @click="() => settings.toggleSideBarOpen()">
                <SquareSplitHorizontalIcon class="size-4 stroke-1.5 group-hover:stroke-2" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-sm">Split Screen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <!--
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger :as-child="true">
              <Button size="icon" variant="outline" class="group" @click="clearChatMessages">
                <SquareXIcon class="size-4 stroke-1.5 group-hover:stroke-2 group-hover:text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-sm">Clear messages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
-->
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
        :display-name="message.role === 'user' ? $t('chat.user.placeholder') : assistant?.title"
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
      <!-- tool call message -->
      <ChatToolCallMessage v-if="activeTools.length > 0" :display-name="assistant?.title" :active-tools="activeTools" />
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
        <form
          id="chatInputForm"
          ref="chatInputFormRef"
          class="relative flex w-full items-center space-x-2 border-0"
          @submit.prevent="onSubmit"
        >
          <div class="relative z-10 max-h-96 w-full">
            <Textarea
              v-model="inputMessage"
              :placeholder="$t('chat.placeholder')"
              class="resize-none rounded-2xl py-3 pr-14 focus:shadow-lg"
              @keydown.enter="onKeyDownEnter"
              @input="adjustTextareaHeight"
            />
          </div>
          <Button
            v-if="!isStreaming"
            class="absolute bottom-1 right-2 z-10"
            type="submit"
            size="icon"
            variant="ghost"
            :disabled="!inputMessage || isPending"
          >
            <SendIcon class="size-5 stroke-1.5" />
          </Button>
          <Button
            v-if="isStreaming"
            variant="outline"
            size="icon"
            class="group absolute bottom-2 right-2 z-20 mr-1 size-8 rounded-full bg-slate-100"
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
