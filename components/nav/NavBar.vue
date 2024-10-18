<script setup lang="ts">
  import { useMousePressed } from '@vueuse/core';
  import {
    BotIcon,
    MessagesSquareIcon,
    ArchiveIcon,
    HomeIcon,
    FileTextIcon,
    WorkflowIcon,
    DatabaseIcon,
    CloudUploadIcon,
    ChevronRightIcon,
    SettingsIcon,
    Building2Icon,
    UsersIcon,
    FolderKanbanIcon,
    BriefcaseBusinessIcon,
    UserIcon,
    SpeechIcon,
    ImageIcon,
    type LucideProps,
    FolderIcon,
    PaintbrushVerticalIcon,
    FoldersIcon,
    ImagesIcon,
    CompassIcon,
  } from 'lucide-vue-next';
  import type { FunctionalComponent } from 'vue';

  interface NavItem {
    icon: FunctionalComponent<LucideProps, {}, any, {}> | null;
    path: string;
    label: string;
    hidden: boolean | null;
    children: NavItem[];
  }

  enum UserRoles {
    ADMIN = 'admin',
    // Additional roles...
  }

  const navBarRef = ref(null);
  const navBarResizerRef = ref(null);

  const route = useRoute();

  const navBar = useNavBarStore();
  const workspaceStore = useWorkspaceStore();
  const { data: auth } = useAuth();

  const homeNavItem: NavItem = {
    icon: HomeIcon,
    path: '/',
    label: 'Home',
    hidden: false,
    children: [],
  };

  const spacerNavItem: NavItem = {
    icon: null,
    path: '',
    label: '',
    hidden: false,
    children: [],
  };

  const defaultRoutes = computed((): NavItem[] => [
    {
      icon: WorkflowIcon,
      path: `/projects/${workspaceStore.activeProjectId}`,
      label: 'Workflows',
      hidden: false,
      children: [],
    },
    {
      icon: ImageIcon,
      path: '/text-to-image',
      label: 'Image Gen',
      hidden: false,
      children: [],
    },
    spacerNavItem,
    {
      icon: MessagesSquareIcon,
      path: '/chats',
      label: 'Chat',
      hidden: false,
      children: [],
    },
    {
      icon: ArchiveIcon,
      path: '/chats/history',
      label: 'Chat History',
      hidden: false,
      children: [],
    },
    {
      icon: BotIcon,
      path: '/assistants',
      label: 'Assistants',
      hidden: false,
      children: [],
    },
    spacerNavItem,
    {
      icon: DatabaseIcon,
      path: '/collections',
      label: 'Collections',
      hidden: false,
      children: [],
    },
    {
      icon: CloudUploadIcon,
      path: '/media',
      label: 'File Manager',
      hidden: false,
      children: [],
    },
    {
      icon: SpeechIcon,
      path: '/speech',
      label: 'Speech',
      hidden: false,
      children: [],
    },
  ]);

  const settingsRoutes: NavItem[] = [
    {
      icon: SettingsIcon,
      path: '/settings',
      label: 'Settings',
      hidden: false,
      children: [
        {
          icon: UserIcon,
          path: '/settings/profile',
          label: 'My Profile',
          hidden: false,
          children: [],
        },
      ],
    },
    {
      icon: Building2Icon,
      path: '/settings/organization',
      label: 'Organization',
      hidden: false,
      children: [
        {
          icon: Building2Icon,
          path: '/settings/organization',
          label: 'Overview',
          hidden: false,
          children: [],
        },
        {
          icon: UsersIcon,
          path: '/settings/organization/members',
          label: 'Members',
          hidden: false,
          children: [],
        },
        {
          icon: SettingsIcon,
          path: '/settings/organization/billing',
          label: 'Billing',
          hidden: false,
          children: [],
        },
        {
          icon: SettingsIcon,
          path: '/settings/organization/models',
          label: 'Models',
          hidden: false,
          children: [],
        },
        {
          icon: SettingsIcon,
          path: '/settings/organization/statistics',
          label: 'Statistics',
          hidden: false,
          children: [],
        },
        {
          icon: SettingsIcon,
          path: '/settings/organization/privacy',
          label: 'Privacy',
          hidden: false,
          children: [],
        },
      ],
    },
    {
      icon: BriefcaseBusinessIcon,
      path: '/settings/workspaces',
      label: 'Workspaces',
      hidden: false,
      children: [
        {
          icon: BriefcaseBusinessIcon,
          path: '/settings/workspaces',
          label: 'Overview',
          hidden: false,
          children: [],
        },
        {
          icon: UsersIcon,
          path: '/settings/workspace/users',
          label: 'Users',
          hidden: false,
          children: [],
        },
      ],
    },
    {
      icon: FolderKanbanIcon,
      path: '/settings/projects',
      label: 'Projects',
      hidden: false,
      children: [
        {
          icon: FolderKanbanIcon,
          path: '/settings/projects',
          label: 'Overview',
          hidden: false,
          children: [],
        },
        {
          icon: UsersIcon,
          path: '/settings/project/users',
          label: 'Users',
          hidden: false,
          children: [],
        },
      ],
    },
  ];

  const adminRoutes: NavItem[] = [
    spacerNavItem,
    {
      icon: SettingsIcon,
      path: '/admin',
      label: 'Space Manager',
      hidden: false,
      children: [],
    },
  ];

  const imageGenRoutes: NavItem[] = [
    {
      icon: PaintbrushVerticalIcon,
      path: '/text-to-image',
      label: 'Create',
      hidden: false,
      children: [],
    },
    // Explore
    {
      icon: CompassIcon,
      path: '/text-to-image/explore',
      label: 'Explore',
      hidden: false,
      children: [],
    },
    // Assets
    /*{
      icon: FoldersIcon,
      path: '/text-to-image/assets',
      label: 'Assets',
      hidden: false,
      children: [],
    },*/
  ];

  const isAdmin = computed(() => auth.value?.user.roles?.includes(UserRoles.ADMIN) ?? false);

  const navItems: Ref<NavItem[]> = computed((): NavItem[] => {
    const items = [homeNavItem, spacerNavItem];

    if (route.path.startsWith('/settings')) {
      items.push(...settingsRoutes);
    } else if (route.path.startsWith('/text-to-image')) {
      items.push(...imageGenRoutes);
    } else {
      items.push(...defaultRoutes.value);

      if (isAdmin.value) {
        items.push(...adminRoutes);
      }
    }

    return items;
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
        <BrandLogo class="ml-[1.455rem]" :text-visible="navBar.isOpen" />
      </div>
      <div id="spacer" class="h-4"></div>
      <div v-if="navBar.isOpen" class="px-4 pb-4">
        <ProjectSelectGlobal select-trigger-class="bg-neutral-50" />
      </div>
      <div class="flex h-full flex-col">
        <ul class="space-y-2">
          <template v-for="(item, index) in navItems" :key="index">
            <li v-if="item.path" class="nav-item">
              <NavLink
                v-if="item.path"
                :active="route.path === item.path"
                :to="item.path"
                :icon="item.icon"
                :label="item.label"
                :label-visible="navBar.isOpen"
              />
              <ul v-if="item.children.length > 0" :class="navBar.isOpen ? 'block' : 'hidden'">
                <li v-for="child in item.children" :key="child?.path" class="nav-item-child">
                  <NavLink
                    :active="$route.path === child?.path"
                    :to="child?.path"
                    :icon="child?.icon"
                    :label="child?.label"
                    :label-visible="navBar.isOpen"
                  />
                </li>
              </ul>
            </li>
            <li v-else class="px-5">
              <Separator class="bg-stone-200" />
            </li>
          </template>
        </ul>
      </div>
      <div
        class="absolute bottom-4 right-2 z-10 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/0 opacity-80 hover:border"
        @click="() => navBar.toggleOpen()"
      >
        <ChevronRightIcon class="size-4 text-muted-foreground/50" :class="{ 'rotate-180 transform': navBar.isOpen }" />
      </div>
    </div>
    <div class="px-5">
      <Separator class="bg-stone-200" />
    </div>
    <div class="nav-text p-5">
      <UserNavBox :icon-only="!navBar.isOpen" />
    </div>
  </div>
</template>

<style scoped>
  .nav-text {
    @apply text-sm;
  }

  .nav-item {
    @apply flex min-h-8 flex-col justify-center border-0 px-2 py-0;
    @apply nav-text;
  }

  .nav-item-child {
    @apply pl-4 pt-0;
  }
</style>
