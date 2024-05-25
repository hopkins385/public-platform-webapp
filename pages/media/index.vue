<script setup lang="ts">
  import LogoMicrosoftOnedrive from '~icons/logos/microsoft-onedrive';
  import LogoGoogleDrive from '~icons/logos/google-drive';
  import FluentEmojiFlatFileFolder from '~icons/fluent-emoji-flat/file-folder';

  definePageMeta({
    title: 'media.meta.index.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'File Manager',
      label: 'File Manager',
    },
  });

  const getOneDriveAuthUrl = async () => {
    const result = await $fetch('/api/onedrive/consent');
    return result?.data;
  };

  const onAddOneDrive = async () => {
    const url = await getOneDriveAuthUrl();
    if (!url) return;
    navigateTo(url, { external: true });
  };
</script>

<template>
  <SectionContainer>
    <SectionHeading title="File Manager" subtitle="Connect your cloud storage or upload files" />
    <BoxContainer>
      <ul class="max-w-sm space-y-5">
        <li class="group flex cursor-pointer items-center space-x-10 rounded-lg" @click="navigateTo('/media/onedrive')">
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <LogoMicrosoftOnedrive class="size-full" />
          </div>
          <p class="pt-2 text-sm">One Drive</p>
        </li>
        <li class="group flex cursor-pointer items-center space-x-10 rounded-lg" @click="navigateTo('/media/google')">
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <LogoGoogleDrive class="size-full" />
          </div>
          <p class="pt-2 text-sm">Google Drive</p>
        </li>
        <li class="group flex cursor-pointer items-center space-x-10 rounded-lg" @click="navigateTo('/media/uploads')">
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <FluentEmojiFlatFileFolder class="size-full" />
          </div>
          <p class="pt-2 text-sm">Uploads</p>
        </li>
      </ul>
    </BoxContainer>
  </SectionContainer>
</template>
