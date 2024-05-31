<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core';
  import { CircleUserIcon, SquareArrowOutUpRightIcon } from 'lucide-vue-next';

  const props = defineProps<{
    iconOnly?: boolean;
  }>();

  const socket = useWebsocketGlobal();

  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe({ immediate: false });

  const creditsChangedListener = useDebounceFn(async (data: any) => {
    console.log('credits changed', data);
    await refresh();
  }, 1000);

  onMounted(async () => {
    socket.on('usage', creditsChangedListener);
    await refresh();
  });

  onBeforeUnmount(() => {
    socket.off('usage', creditsChangedListener);
  });
</script>

<template>
  <div v-if="!iconOnly" class="flex flex-col space-y-3">
    <div class="flex px-2">
      <div class="w-full pr-4">
        <div class="opacity-50">Account</div>
        <div class="pr-2 opacity-75">
          <NuxtLinkLocale to="/user/profile" class="hover:underline">
            <span>{{ user?.name }}</span>
            <span>
              <SquareArrowOutUpRightIcon class="ml-2 inline-block size-3 stroke-1.5 opacity-60" />
            </span>
          </NuxtLinkLocale>
        </div>
      </div>
      <div class="shrink-0 whitespace-nowrap">
        <div class="opacity-50">Credits</div>
        <div class="opacity-75">{{ user?.credit[0]?.amount }} / 1000</div>
      </div>
    </div>
    <div>
      <button class="w-full rounded-full bg-stone-200/60 px-4 py-2 font-semibold">Upgrade to Pro</button>
    </div>
  </div>
  <div class="pb-2" v-else>
    <div class="mx-auto w-fit opacity-60">
      <NuxtLinkLocale to="/user/profile" class="hover:underline">
        <CircleUserIcon class="inline-block size-5 stroke-1" />
      </NuxtLinkLocale>
    </div>
  </div>
</template>
