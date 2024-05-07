<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core';
  import {
    UserIcon,
    BotIcon,
    MessagesSquareIcon,
    PenLineIcon,
    ArchiveIcon,
    HomeIcon,
    FoldersIcon,
    FileTextIcon,
    UploadIcon,
    FolderIcon,
    WorkflowIcon,
    DatabaseIcon,
    LibraryIcon,
    SquareLibraryIcon,
    CloudUploadIcon,
    Layers3Icon,
    LayersIcon,
  } from 'lucide-vue-next';

  const navBarRef = ref(null);
  const navBarOpen = ref(true);

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
        label: 'Chats',
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

  onClickOutside(navBarRef, () => {
    // navBarOpen.value = false;
  });
</script>

<template>
  <div
    ref="navBarRef"
    class="h-full shrink-0 border-0 bg-white shadow-md"
    :class="navBarOpen ? 'w-60' : 'w-20'"
    @click="navBarOpen = true"
  >
    <div class="flex h-full flex-col">
      <ul class="space-y-4 pt-8 text-muted-foreground">
        <template v-for="(item, index) in navItems" :key="index">
          <li
            class="nav-item"
            v-if="!item.hidden"
            :class="{
              'pl-7': !navBarOpen,
              'pl-10': navBarOpen,
            }"
          >
            <NavLink
              :active="$route.path === item.to"
              :to="item.to"
              :icon="item.icon"
              :label="item.label"
              :label-visible="navBarOpen"
            />
            <ul
              v-if="item.children.length > 0"
              :class="navBarOpen ? 'block' : 'hidden'"
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
                  :label-visible="navBarOpen"
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
