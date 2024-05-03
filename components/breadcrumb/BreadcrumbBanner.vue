<script setup lang="ts">
  import {
    AlignJustify,
    FileTextIcon,
    FolderIcon,
    FoldersIcon,
    UsersIcon,
    WorkflowIcon,
  } from 'lucide-vue-next';

  const props = defineProps<{
    links: {
      icon: string;
      label: string;
      to: string;
    }[];
  }>();

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
</script>

<template>
  <BoxContainer class="mb-4 py-5">
    <Breadcrumb>
      <BreadcrumbList>
        <template v-for="(link, index) in links" :key="index">
          <BreadcrumbItem>
            <NuxtLink
              v-bind="link"
              class="flex items-center justify-center space-x-2 transition-colors hover:text-foreground"
            >
              <span>
                <component :is="getIcon(link.icon)" class="size-4" />
              </span>
              <span>{{ link.label }}</span>
            </NuxtLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="props.links.length - 1 !== index" />
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </BoxContainer>
</template>
