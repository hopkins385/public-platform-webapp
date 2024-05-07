<script setup lang="ts">
  import {
    AlignJustify,
    FileTextIcon,
    FolderIcon,
    FoldersIcon,
    UsersIcon,
    WorkflowIcon,
  } from 'lucide-vue-next';

  function getIcon(icon: string) {
    return {
      users: UsersIcon,
      folder: FolderIcon,
      folders: FoldersIcon,
      text: FileTextIcon,
      workflow: WorkflowIcon,
      project: AlignJustify,
    }[icon];
  }

  const { breadcrumbs: links } = useBreadcrumbs();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(link, index) in links" :key="index">
        <BreadcrumbItem>
          <NuxtLink
            :to="link?.path"
            class="flex items-center justify-center text-sm transition-colors hover:text-foreground"
          >
            <span v-if="link?.icon">
              <component :is="getIcon(link?.icon)" class="size-4 stroke-2" />
            </span>
            <span>{{ link?.name }}</span>
          </NuxtLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="links.length - 1 !== index" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
