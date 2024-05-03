<script setup lang="ts">
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
  } from 'lucide-vue-next';

  const router = useRouter();

  const navItems = computed(() => {
    const { projectId } = router.currentRoute.value.params;
    return [
      {
        icon: HomeIcon,
        to: '/project',
        hidden: false,
        children: [],
      },
      {
        icon: FolderIcon,
        to: '/project',
        hidden: false,
        children: [],
      },
      {
        icon: FileTextIcon,
        to: `/document`,
        children: [],
      },
      {
        icon: PenLineIcon,
        to: '/editor',
        hidden: true,
        children: [],
      },
      {
        icon: BotIcon,
        to: '/assistant',
        hidden: false,
        children: [],
      },
      {
        icon: MessagesSquareIcon,
        to: '/',
        hidden: false,
        children: [],
      },
      {
        icon: ArchiveIcon,
        to: '/chat/history',
        hidden: false,
        children: [],
      },
      {
        icon: UploadIcon,
        to: '/media',
        children: [],
      },
    ];
  });
</script>

<template>
  <div class="flex h-full flex-col">
    <ul class="space-y-4 pt-8 text-muted-foreground">
      <template v-for="(item, index) in navItems" :key="index">
        <li class="nav-item" v-if="!item.hidden">
          <NuxtLinkLocale :to="item.to">
            <component :is="item.icon" class="nav-icon" />
          </NuxtLinkLocale>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
  .nav-item {
    @apply mx-auto flex size-8 items-center justify-center transition-colors hover:text-foreground;
  }
  .nav-icon {
    @apply size-5 fill-slate-100 stroke-1.5;
  }
</style>
