<script setup lang="ts">
  import {
    UserIcon,
    BotIcon,
    MessagesSquareIcon,
    BoltIcon,
    Disc3Icon,
    PenLineIcon,
    FolderClosedIcon,
    ArchiveIcon,
    LayoutGridIcon,
    FilesIcon,
  } from 'lucide-vue-next';
  const playground = false;

  const has = computed(() => {
    const { projectId, documentId } = useRoute().params;
    return {
      projectId,
      documentId,
    };
  });
</script>

<template>
  <div class="flex h-full flex-col justify-between">
    <div>
      <div class="pt-8">
        <div class="mx-auto flex size-8 flex-col items-center justify-center">
          <span class="opacity-95">
            <IconSvenson class="size-7 drop-shadow-sm" />
          </span>
          <span class="hidden opacity-60" style="font-size: 0.7rem">RAGNA</span>
        </div>
      </div>
      <ul class="hidden space-y-4 pt-5">
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
        <li v-show="has.projectId" class="nav-item">
          <NuxtLinkLocale :to="`/project/${has.projectId}/document`">
            <FilesIcon class="nav-icon" />
          </NuxtLinkLocale>
        </li>
        <!-- li class="nav-item">
        <NuxtLink href="/workflow">
          <WorkflowIcon class="nav-icon" />
        </NuxtLink>
      </!-->
        <li v-show="has.projectId && has.documentId" class="nav-item">
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
          <NuxtLink href="/media">
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
    <ul class="space-y-4 pb-8">
      <li class="nav-item rounded-full border p-4">
        <NuxtLink href="/user/profile">
          <UserIcon class="nav-icon opacity-60" />
        </NuxtLink>
      </li>
    </ul>
    <div class="hidden pb-8">
      <div class="mx-auto flex size-8 flex-col items-center justify-center">
        <span class="opacity-80">
          <IconSvenson class="size-7" />
        </span>
        <span class="opacity-60" style="font-size: 0.7rem">RAGNA</span>
      </div>
    </div>
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
