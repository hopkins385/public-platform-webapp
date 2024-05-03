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
        icon: FoldersIcon,
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
  <div class="flex h-full flex-col justify-between">
    <div>
      <div class="pt-8">
        <NuxtLink href="/user/profile">
          <div class="mx-auto flex size-8 flex-col items-center justify-center">
            <span class="opacity-95">
              <IconSvenson class="size-7 drop-shadow-sm" />
            </span>
            <span class="hidden opacity-60" style="font-size: 0.7rem">
              RAGNA
            </span>
          </div>
        </NuxtLink>
      </div>
      <ul class="space-y-4 pt-8">
        <template v-for="(item, index) in navItems" :key="index">
          <li class="nav-item" v-if="!item.hidden">
            <NuxtLinkLocale :to="item.to">
              <component :is="item.icon" class="nav-icon" />
            </NuxtLinkLocale>
          </li>
        </template>
      </ul>
    </div>
    <ul class="space-y-4 pb-8">
      <li class="nav-item rounded-full border p-4">
        <NuxtLink href="/user/profile">
          <UserIcon class="nav-icon opacity-60" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .nav-item {
    @apply mx-auto flex size-8 items-center justify-center;
  }
  .nav-icon {
    @apply size-5 stroke-1.5;
  }
</style>
