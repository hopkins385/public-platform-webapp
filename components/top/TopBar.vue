<script setup lang="ts">
  import {
    BellIcon,
    ExpandIcon,
    LayoutGridIcon,
    UserIcon,
  } from 'lucide-vue-next';

  const breadcrumbLinks = computed(() => {
    return [
      { icon: 'users', label: 'Team', to: '/' },
      { icon: 'folders', label: 'Projects', to: '/project' },
      {
        icon: 'folder',
        label: 'Project',
        to: `/project/:projectId`,
      },
      { icon: 'workflow', label: 'Workflows', to: `/project/:projectId` },
    ];
  });

  function onFullScreenClick() {
    const elem = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elem.requestFullscreen();
    }
  }
</script>

<template>
  <div class="flex size-full items-center justify-between">
    <div class="flex items-center justify-center pl-11">
      <NuxtLink href="/">
        <div class="flex size-8 flex-col items-center justify-center">
          <span class="opacity-95">
            <IconSvenson class="size-7 drop-shadow-sm" />
          </span>
          <span class="hidden opacity-60" style="font-size: 0.7rem">
            RAGNA
          </span>
        </div>
      </NuxtLink>
      <BreadcrumbBanner :links="breadcrumbLinks" class="pl-10" />
    </div>
    <div class="flex items-center justify-between space-x-4 pr-5">
      <div class="flex items-center justify-center space-x-1">
        <button class="rounded-full p-2 hover:bg-secondary">
          <LayoutGridIcon
            class="stroke-1.5 opacity-60"
            style="width: 1.15rem; height: 1.15rem"
          />
        </button>
        <button
          class="rounded-full p-2 hover:bg-secondary"
          @click="onFullScreenClick"
        >
          <ExpandIcon
            class="stroke-1.5 opacity-60"
            style="width: 1.15rem; height: 1.15rem"
          />
        </button>
        <button class="rounded-full p-2 hover:bg-secondary">
          <BellIcon
            class="stroke-1.5 opacity-60"
            style="width: 1.15rem; height: 1.15rem"
          />
        </button>
      </div>
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-secondary p-4"
      >
        <NuxtLink href="/user/profile">
          <UserIcon class="size-4 stroke-1.5 opacity-60" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
