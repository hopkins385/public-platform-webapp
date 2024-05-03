<script setup lang="ts">
  import {
    AlignJustify,
    FileTextIcon,
    FolderIcon,
    FoldersIcon,
    UsersIcon,
    WorkflowIcon,
  } from 'lucide-vue-next';

  /*const props = defineProps<{
      links: {
        icon: string;
        label: string;
        to: string;
      }[];
    }>();
    */

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

  const router = useRouter();
  const routes = [
    {
      path: '/',
      name: 'Home',
      label: 'Home',
      to: '/',
    },
    {
      path: '/project',
      name: 'Projects',
      label: 'Projects',
      to: '/project',
    },
    {
      path: '/project/:projectId()',
      name: 'Project',
      label: 'Project',
      to: '/project/:projectId()',
    },
    {
      path: '/project/:projectId()/workflow',
      name: 'Workflow',
      label: 'Workflow',
      to: '/project/:projectId()/workflow',
    },
    {
      path: '/project/:projectId()/workflow/:workflowId()',
      name: 'Workflow',
      label: 'Workflow',
      to: '/project/:projectId()/workflow/:workflowId()',
    },
  ];

  const { breadcrumbs: links } = useBreadcrumbs();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(link, index) in links" :key="index">
        <BreadcrumbItem>
          <NuxtLink
            :to="link?.path"
            class="flex items-center justify-center space-x-0 text-sm transition-colors hover:text-foreground"
          >
            <span class="hidden">
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
