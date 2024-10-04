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
  } from 'lucide-vue-next';

  const props = defineProps<{
    isSettings?: boolean;
  }>();

  const navBarRef = ref(null);
  const navBarResizerRef = ref(null);

  const route = useRoute();

  const navBar = useNavBarStore();
  const workspaceStore = useWorkspaceStore();
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

  const defaultNavItems = computed(() => {
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
        to: `/projects/${workspaceStore.activeProjectId}`,
        label: 'Workflows',
        hidden: false,
        children: [],
      },
      /*{
        name: 'documents',
        icon: FileTextIcon,
        to: `/documents`,
        label: 'Documents',
        children: [],
      },
      {
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
      {
        name: 'image-gen',
        icon: ImageIcon,
        to: '/image-gen',
        label: 'Image Gen',
        children: [],
      },
      {
        name: 'speech',
        icon: SpeechIcon,
        to: `/speech`,
        label: 'Speech',
        children: [],
      },
    ];
    if (auth.value?.user.roles?.includes('admin')) {
      return [...publicRoutes, ...adminRoutes];
    }
    return publicRoutes;
  });

  const settings = [
    {
      name: 'Profile',
      icon: UserIcon,
      to: '/settings/profile',
      label: 'My Profile',
      hidden: false,
      children: [],
    },
    {
      name: 'Organization',
      icon: Building2Icon,
      to: '/settings/organization',
      label: 'Organization',
      hidden: false,
      children: [
        {
          name: 'Organization',
          icon: Building2Icon,
          to: '/settings/organization',
          label: 'Overview',
          hidden: false,
        },
        {
          name: 'Members',
          icon: UsersIcon,
          to: '/settings/organization/members',
          label: 'Members',
          hidden: false,
        },
        {
          name: 'Billing',
          icon: SettingsIcon,
          to: '/settings/organization/billing',
          label: 'Billing',
          hidden: false,
        },
        {
          name: 'Models',
          icon: SettingsIcon,
          to: '/settings/organization/models',
          label: 'Models',
          hidden: false,
        },
        {
          name: 'Statistics',
          icon: SettingsIcon,
          to: '/settings/organization/statistics',
          label: 'Statistics',
          hidden: false,
        },
        {
          name: 'Privacy',
          icon: SettingsIcon,
          to: '/settings/organization/privacy',
          label: 'Privacy',
          hidden: false,
        },
      ],
    },
    {
      name: 'Workspace',
      icon: BriefcaseBusinessIcon,
      to: '/settings/workspaces',
      label: 'Workspaces',
      hidden: false,
      children: [
        {
          name: 'General',
          icon: BriefcaseBusinessIcon,
          to: '/settings/workspaces',
          label: 'Overview',
        },
        {
          name: 'Users',
          icon: UsersIcon,
          to: '/settings/workspace/users',
          label: 'Users',
        },
      ],
    },
    {
      name: 'Project',
      icon: FolderKanbanIcon,
      to: '/settings/projects',
      label: 'Projects',
      hidden: false,
      children: [
        {
          name: 'General',
          icon: FolderKanbanIcon,
          to: '/settings/projects',
          label: 'Overview',
        },
        {
          name: 'Users',
          icon: UsersIcon,
          to: '/settings/project/users',
          label: 'Users',
        },
      ],
    },
  ];

  const navItems = computed(() => {
    if (props.isSettings) {
      return settings;
    }
    return defaultNavItems.value;
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
      <div id="spacer" class="h-4"></div>
      <div v-if="navBar.isOpen" class="px-4 pb-4">
        <ProjectSelectGlobal select-trigger-class="bg-neutral-50" />
      </div>
      <div class="flex h-full flex-col">
        <ul class="space-y-2">
          <template v-for="(item, index) in navItems" :key="index">
            <li v-if="item.to" class="nav-item">
              <NavLink
                v-if="item.to"
                :active="route.path === item.to"
                :to="item.to"
                :icon="item.icon"
                :label="item.label"
                :label-visible="navBar.isOpen"
              />
              <ul v-if="item.children.length > 0" :class="navBar.isOpen ? 'block' : 'hidden'">
                <li v-for="child in item.children" :key="child?.to" class="nav-item-child">
                  <NavLink
                    :active="$route.path === child?.to"
                    :to="child?.to"
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
    @apply flex min-h-8 flex-col justify-center border-0 px-4 py-0;
    @apply nav-text;
  }

  .nav-item-child {
    @apply pl-4 pt-0;
  }
</style>
