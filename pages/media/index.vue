<script setup lang="ts">
  import LogosMicrosoftOnedrive from '~icons/logos/microsoft-onedrive';
  import LogosGoogleDrive from '~icons/logos/google-drive';
  import FluentEmojiFlatFileFolder from '~icons/fluent-emoji-flat/file-folder';

  const getOneDriveAuthUrl = async () => {
    const { data: result } = await useFetch('/api/onedrive/consent');
    return result.value?.data;
  };

  const onAddOneDrive = async () => {
    const url = await getOneDriveAuthUrl();
    if (!url) return;
    navigateTo(url, { external: true });
  };
</script>

<template>
  <SectionContainer>
    <BoxContainer>
      <h1 class="pb-10 text-2xl font-bold">File Manager</h1>
      <ul class="max-w-sm space-y-5">
        <li
          class="group flex cursor-pointer items-center space-x-10 rounded-lg"
          @click="navigateTo('/media/onedrive')"
        >
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <LogosMicrosoftOnedrive class="size-full" />
          </div>
          <p class="pt-2 text-sm">One Drive</p>
        </li>
        <li
          class="group flex cursor-pointer items-center space-x-10 rounded-lg"
          @click="navigateTo('/media/google')"
        >
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <LogosGoogleDrive class="size-full" />
          </div>
          <p class="pt-2 text-sm">Google Drive</p>
        </li>
        <li
          class="group flex cursor-pointer items-center space-x-10 rounded-lg"
          @click="navigateTo('/media/files')"
        >
          <div class="size-20 rounded-lg border p-5 group-hover:shadow-md">
            <FluentEmojiFlatFileFolder class="size-full" />
          </div>
          <p class="pt-2 text-sm">Uploads</p>
        </li>
      </ul>
    </BoxContainer>
  </SectionContainer>
</template>
