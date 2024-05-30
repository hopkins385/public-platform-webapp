<script setup lang="ts">
  import { useMousePressed } from '@vueuse/core';
  import {
    BotIcon,
    MessagesSquareIcon,
    PenLineIcon,
    ArchiveIcon,
    HomeIcon,
    FileTextIcon,
    FolderIcon,
    WorkflowIcon,
    DatabaseIcon,
    CloudUploadIcon,
    LayersIcon,
    ChevronRightIcon,
    SettingsIcon,
  } from 'lucide-vue-next';

  const navBarRef = ref(null);
  const navBarResizerRef = ref(null);

  const navBar = useNavBarStore();
  const { data: auth } = useAuth();

  const adminRoutes = [
    {
      name: 'spacer',
      icon: null,
      to: null,
      label: null,
      hidden: false,
      children: [],
    },
    {
      name: 'admin',
      icon: SettingsIcon,
      to: '/admin',
      label: 'Space Manager',
      hidden: false,
      children: [],
    },
  ];

  const navItems = computed(() => {
    const publicRoutes = [
      {
        name: 'home',
        icon: HomeIcon,
        to: '/',
        label: 'Home',
        hidden: false,
        children: [],
      },
      {
        name: 'workflows',
        icon: WorkflowIcon,
        to: '/workflows',
        label: 'Workflows',
        hidden: false,
        children: [],
      },
      {
        name: 'documents',
        icon: FileTextIcon,
        to: `/documents`,
        label: 'Documents',
        children: [],
      },
      /*{
        name: 'editor',
        icon: PenLineIcon,
        to: '/editor',
        label: 'Editor',
        hidden: true,
        children: [],
      },*/
      {
        name: 'chats',
        icon: MessagesSquareIcon,
        to: '/chats',
        label: 'Chat',
        hidden: false,
        children: [],
      },
      {
        name: 'chat-history',
        icon: ArchiveIcon,
        to: '/chats/history',
        label: 'Chat History',
        hidden: false,
        children: [],
      },
      {
        name: 'assistants',
        icon: BotIcon,
        to: '/assistants',
        label: 'Assistants',
        hidden: false,
        children: [],
      },
      {
        name: 'collections',
        icon: DatabaseIcon,
        to: `/collections`,
        label: 'Collections',
        children: [],
      },
      {
        name: 'media',
        icon: CloudUploadIcon,
        to: '/media',
        label: 'File Manager',
        children: [],
      },
    ];
    if (auth.value?.user.roles?.includes('admin')) {
      return [...publicRoutes, ...adminRoutes];
    }
    return publicRoutes;
  });

  const { pressed } = useMousePressed({ target: navBarResizerRef });

  function onFullScreenClick() {
    const elem = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elem.requestFullscreen();
    }
  }

  watch(pressed, (isPressed) => {
    if (isPressed && navBar.isOpen) {
      addEventListener('mousemove', navBar.setWidth);
    } else {
      removeEventListener('mousemove', navBar.setWidth);
    }
  });
</script>

<template>
  <div
    ref="navBarRef"
    class="relative flex h-full shrink-0 flex-col justify-between border-r bg-stone-50 transition-all duration-300 ease-out"
    :style="{ width: navBar.isFullClosed ? 0 : `${navBar.width}rem` }"
  >
    <div
      ref="navBarResizerRef"
      class="absolute right-0 top-0 z-10 h-full"
      :class="{
        'bg-blue-600': pressed && navBar.isOpen,
        'cursor-ew-resize hover:bg-blue-600': navBar.isOpen,
      }"
      style="width: 0.25rem"
    ></div>
    <div
      class="relative h-full overflow-y-hidden transition-opacity duration-200 ease-in-out"
      :class="{
        'opacity-0': navBar.isFullClosed,
      }"
    >
      <div class="flex justify-between pt-4">
        <BrandLogo class="ml-[1.855rem]" :text-visible="navBar.isOpen" />
      </div>
      <div class="h-4" id="spacer"></div>
      <!-- div class="px-4 pb-4" v-if="navBar.isOpen">
        <ProjectSelectGlobal select-trigger-class="bg-neutral-50" />
      </!-->
      <div class="flex h-full flex-col">
        <ul class="space-y-2">
          <template v-for="(item, index) in navItems" :key="index">
            <li v-if="item.to" class="nav-item">
              <NavLink
                v-if="item.to"
                :active="$route.path === item.to"
                :to="item.to"
                :icon="item.icon"
                :label="item.label"
                :label-visible="navBar.isOpen"
              />
              <!-- ul v-if="item.children.length > 0 && true === false" :class="navBar.isOpen ? 'block' : 'hidden'">
                <li class="nav-item-child" v-for="(child, index) in item.children" :key="index">
                  <NavLink
                    :active="$route.path === child?.to"
                    :to="child?.to"
                    :icon="child?.icon"
                    :label="child?.label"
                    :label-visible="navBar.isOpen"
                  />
                </li>
              </!-->
            </li>
            <li v-else class="px-5">
              <Separator class="bg-stone-200" />
            </li>
          </template>
        </ul>
      </div>
      <div
        class="absolute bottom-2 right-2 z-10 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/0 opacity-80 hover:border"
        @click="() => navBar.toggleOpen()"
      >
        <ChevronRightIcon class="size-4 text-muted-foreground/50" :class="{ 'rotate-180 transform': navBar.isOpen }" />
      </div>
    </div>
    <div
      class="nav-text border-t border-gray-200 p-5 transition-opacity duration-300 ease-out"
      :class="{
        'opacity-0': !navBar.isOpen,
        'opacity-100': navBar.isOpen,
      }"
    >
      <UserNavBox v-if="navBar.isOpen" />
    </div>
  </div>
</template>

<style scoped>
  .nav-text {
    @apply text-sm;
  }

  .nav-item {
    @apply flex min-h-8 flex-col justify-center border-0 px-4 py-0;
    @apply nav-text;
  }

  .nav-item-child {
    @apply pl-4 pt-0;
  }
</style>
