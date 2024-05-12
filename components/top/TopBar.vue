<script setup lang="ts">
  import {
    BellIcon,
    ExpandIcon,
    LayoutGridIcon,
    UserIcon,
  } from 'lucide-vue-next';

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
    <div class="flex items-center justify-center pl-9">
      <NuxtLink href="/">
        <div class="flex h-8 items-center justify-center space-x-3">
          <span class="opacity-95">
            <IconSvenson class="size-7 drop-shadow-sm" />
          </span>
          <span class="text-sm opacity-75">RAGNA Cloud</span>
        </div>
      </NuxtLink>
      <!-- BreadcrumbBanner class="pl-10" /-->
    </div>
    <div class="flex items-center justify-between space-x-4 pr-5">
      <div class="flex items-center justify-center space-x-1">
        <button class="rounded-full p-2 hover:bg-secondary">
          <LayoutGridIcon
            class="stroke-1 opacity-75"
            style="width: 1.15rem; height: 1.15rem"
          />
        </button>
        <button
          class="rounded-full p-2 hover:bg-secondary"
          @click="onFullScreenClick"
        >
          <ExpandIcon
            class="stroke-1 opacity-75"
            style="width: 1.15rem; height: 1.15rem"
          />
        </button>
        <button class="rounded-full p-2 hover:bg-secondary">
          <BellIcon
            class="stroke-1 opacity-75"
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
