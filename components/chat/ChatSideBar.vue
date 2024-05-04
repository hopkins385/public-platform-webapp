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
    class="h-full shrink-0 pb-40 transition-all ease-in-out"
    :class="{
      'w-20': !sideBarOpen,
      'w-72': sideBarOpen,
    }"
  >
    <BoxContainer class="relative h-full p-5 text-sm">
      <button
        class="absolute right-0 top-0 p-2 text-muted-foreground"
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
        class="h-full overflow-y-auto transition-opacity duration-300 ease-in-out"
        :class="{
          'opacity-0': !sideBarOpen,
          'opacity-100': sideBarOpen,
        }"
      >
        {{ all.chats }}
      </div>
    </BoxContainer>
  </div>
</template>
