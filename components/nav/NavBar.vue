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
  } from 'lucide-vue-next';

  const navBarRef = ref(null);
  const navBarResizerRef = ref(null);

  const navBar = useNavBarStore();

  const { getAllProjects } = useManageProjects();
  const { data: projects } = await getAllProjects({
    lazy: true,
  });

  const projectChildren = computed(() => {
    return projects.value?.map((project: any) => {
      return {
        name: 'project-child',
        icon: FolderIcon,
        to: `/project/${project.id}`,
        label: project.name,
        hidden: false,
      };
    });
  });

  const navItems = computed(() => {
    return [
      {
        name: 'home',
        icon: HomeIcon,
        to: '/project',
        label: 'Home',
        hidden: false,
        children: [],
      },
      {
        name: 'projects',
        icon: LayersIcon,
        to: '/project',
        label: 'Projects',
        hidden: false,
        children: projectChildren.value || [],
      },
      {
        name: 'workflows',
        icon: WorkflowIcon,
        to: '/workflow',
        label: 'Workflows',
        hidden: false,
        children: [],
      },
      {
        name: 'documents',
        icon: FileTextIcon,
        to: `/document`,
        label: 'Documents',
        children: [],
      },
      {
        name: 'collections',
        icon: DatabaseIcon,
        to: `/collection`,
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
        to: '/assistant',
        label: 'Assistants',
        hidden: false,
        children: [],
      },
      {
        name: 'chats',
        icon: MessagesSquareIcon,
        to: '/chat',
        label: 'Chat',
        hidden: false,
        children: [],
      },
      {
        name: 'chat-history',
        icon: ArchiveIcon,
        to: '/chat/history',
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
  });

  const { pressed } = useMousePressed({ target: navBarResizerRef });

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
    class="relative h-full shrink-0 border-0 bg-white shadow-md"
    :style="{ width: `${navBar.width}rem` }"
  >
    <div
      class="absolute left-1/2 top-3 z-10 flex size-7 shrink-0 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white opacity-80 hover:border"
      @click="() => navBar.toggleOpen()"
    >
      <ChevronRightIcon
        class="size-4 text-muted-foreground"
        :class="{ 'rotate-180 transform': navBar.isOpen }"
      />
    </div>
    <div
      ref="navBarResizerRef"
      class="absolute right-0 top-0 h-full"
      :class="{
        'bg-blue-600': pressed && navBar.isOpen,
        'cursor-move hover:bg-blue-600': navBar.isOpen,
      }"
      style="width: 0.25rem"
    ></div>
    <div class="flex h-full flex-col">
      <ul class="space-y-4 pt-12 text-muted-foreground">
        <template v-for="(item, index) in navItems" :key="index">
          <li
            class="nav-item"
            v-if="!item.hidden"
            :class="{
              'pl-7': !navBar.isOpen,
              'pl-10': navBar.isOpen,
            }"
          >
            <NavLink
              :active="$route.path === item.to"
              :to="item.to"
              :icon="item.icon"
              :label="item.label"
              :label-visible="navBar.isOpen"
            />
            <ul
              v-if="item.children.length > 0"
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
  </div>
</template>

<style scoped>
  .nav-item {
    @apply flex min-h-8 flex-col justify-center border-0 text-sm;
  }

  .nav-item-child {
    @apply pl-4 pt-4;
  }
</style>
