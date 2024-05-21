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

  const { getAllProjects } = useManageProjects();
  const { data: projects } = await getAllProjects({
    lazy: true,
  });

  const adminRoutes = [
    {
      name: 'admin',
      icon: SettingsIcon,
      to: '/admin',
      label: 'Space Manager',
      hidden: false,
      children: [],
    },
  ];

  const projectChildren = computed(() => {
    return projects.value?.map((project: any) => {
      return {
        name: 'project-child',
        icon: FolderIcon,
        to: `/projects/${project.id}`,
        label: project.name,
        hidden: false,
      };
    });
  });

  const navItems = computed(() => {
    const publicRoutes = [
      {
        name: 'home',
        icon: HomeIcon,
        to: '/projects',
        label: 'Home',
        hidden: false,
        children: [],
      },
      {
        name: 'projects',
        icon: LayersIcon,
        to: '/projects',
        label: 'Projects',
        hidden: false,
        children: projectChildren.value || [],
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
      {
        name: 'collections',
        icon: DatabaseIcon,
        to: `/collections`,
        label: 'Collections',
        children: [],
      },
      {
        name: 'editor',
        icon: PenLineIcon,
        to: '/editor',
        label: 'Editor',
        hidden: true,
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
    class="relative flex h-full shrink-0 flex-col justify-between border-r bg-stone-50"
    :style="{ width: `${navBar.width}rem` }"
  >
    <div
      ref="navBarResizerRef"
      class="absolute right-0 top-0 z-10 h-full"
      :class="{
        'bg-blue-600': pressed && navBar.isOpen,
        ' cursor-ew-resize hover:bg-blue-600': navBar.isOpen,
      }"
      style="width: 0.25rem"
    ></div>
    <div class="relative h-full">
      <div class="flex justify-between border-0 pl-8 pt-4">
        <BrandLogo :text-visible="navBar.isOpen" />
        <!-- div v-show="navBar.isOpen" class="pr-4">
          <button class="group rounded-full p-2" @click="onFullScreenClick">
            <ExpandIcon
              class="size-4 stroke-1 opacity-50 group-hover:opacity-100"
            />
          </button>
        </!-->
      </div>
      <div class="h-4" id="spacer"></div>
      <!-- div class="px-4 pb-4">
        <ProjectSelectGlobal select-trigger-class="bg-neutral-50" />
      </!-->
      <div class="flex h-full flex-col">
        <ul class="space-y-2">
          <template v-for="(item, index) in navItems" :key="index">
            <li class="nav-item" v-if="!item.hidden">
              <NavLink
                :active="$route.path === item.to"
                :to="item.to"
                :icon="item.icon"
                :label="item.label"
                :label-visible="navBar.isOpen"
              />
              <ul
                v-if="item.children.length > 0 && true === false"
                :class="navBar.isOpen ? 'block' : 'hidden'"
              >
                <li
                  class="nav-item-child"
                  v-for="(child, index) in item.children"
                  :key="index"
                >
                  <NavLink
                    :active="$route.path === child.to"
                    :to="child.to"
                    :icon="child.icon"
                    :label="child.label"
                    :label-visible="navBar.isOpen"
                  />
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
      <div
        class="absolute bottom-2 right-2 z-10 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/0 opacity-80 hover:border"
        @click="() => navBar.toggleOpen()"
      >
        <ChevronRightIcon
          class="size-4 text-muted-foreground/50"
          :class="{ 'rotate-180 transform': navBar.isOpen }"
        />
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
