<script setup lang="ts">
  import {
    UserIcon,
    BotIcon,
    MessagesSquareIcon,
    BoltIcon,
    Disc3Icon,
    PenLineIcon,
    FolderClosedIcon,
    FileTextIcon,
    WorkflowIcon,
    ArchiveIcon,
    LayoutGridIcon,
    LayoutListIcon,
  } from 'lucide-vue-next';
  const playground = false;
</script>

<template>
  <div>
    <ul class="space-y-4 pt-5">
      <li class="nav-item rounded-full border p-4">
        <NuxtLink href="/user/profile">
          <UserIcon class="nav-icon opacity-60" />
        </NuxtLink>
      </li>
    </ul>
    <ul class="space-y-4 pt-8">
      <li class="nav-item">
        <NuxtLink href="/project">
          <LayoutGridIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/requirement">
          <LayoutListIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/workflow">
          <WorkflowIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/editor">
          <PenLineIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/">
          <MessagesSquareIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/assistant">
          <BotIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/chat/history">
          <ArchiveIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/files">
          <FolderClosedIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li v-if="playground" class="nav-item">
        <NuxtLink href="/playground">
          <BoltIcon class="nav-icon" />
        </NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink href="/fine-tuning">
          <Disc3Icon class="nav-icon" />
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
