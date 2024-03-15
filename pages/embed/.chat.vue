<script setup lang="ts">
  const { $client } = useNuxtApp();
  const { messages, hasMessages, addMessage, getFormattedMessages } =
    useChatMessages();
  const { render } = useMarkdown();

  const isPending = ref(false);
  const isStreaming = ref(false);
  const inputMessage = ref('');
  const messageChunk = ref('');

  let ac: AbortController;

  const resetForm = () => {
    messageChunk.value = '';
    isPending.value = false;
    isStreaming.value = false;
  };

  const onSubmit = async () => {
    ac = new AbortController();
    if (!inputMessage.value || isPending.value || isStreaming.value) {
      return;
    }

    addMessage(inputMessage.value, 'user');
    inputMessage.value = '';
    isPending.value = true;

    const response = await $fetch('/api/chat/documents', {
      method: 'POST',
      body: JSON.stringify({ messages: getFormattedMessages() }),
      signal: ac.signal,
      responseType: 'stream',
    });

    // const result = await $client.embed.conversation.query({
    //   messages: getFormattedMessages(),
    // });

    isPending.value = false;
    // if (!result) return;
    // addMessage(result?.response, 'assistant');

    if (!(response instanceof ReadableStream)) {
      console.error('response is not a stream');
      return;
    }

    try {
      const reader = response.getReader();
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
      console.log(error);
    }
  };

  const onAbort = () => {
    addMessage(messageChunk.value, 'assistant');
    resetForm();
  };
</script>

<template>
  <BoxContainer
    id="chatWrapper"
    class="relative flex h-full flex-col px-20 py-10 lg:px-40 xl:px-60"
  >
    <div
      id="chatMessagesContainer"
      ref="chatMessagesContainerRef"
      class="relative grow overflow-y-scroll rounded-lg"
    >
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

      <div class="h-10 border-0"></div>
    </div>
    <div id="chatInputWrapper" class="relative shrink-0 pt-5">
      <form class="flex items-center space-x-2" @submit.prevent="onSubmit">
        <Input
          v-model="inputMessage"
          :placeholder="$t('chat.placeholder')"
          class="rounded-2xl py-6"
        />
        <Button type="submit">
          {{ $t('chat.send') }}
        </Button>
      </form>
      <Button
        v-if="isStreaming"
        variant="outline"
        size="icon"
        class="group absolute right-24 top-7 mr-1 size-8 rounded-full bg-slate-100"
        @click="onAbort"
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
