<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core';
  import {
    SquareArrowOutUpRightIcon,
    SquareArrowUpRightIcon,
  } from 'lucide-vue-next';

  const socket = useWebsocket();
  const { data: auth } = useAuth();
  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe({ immediate: false });

  const creditsChangedListener = useDebounceFn((data: any) => {
    console.log('credits changed', data);
    refresh();
  }, 1000);

  onMounted(() => {
    if (!auth.value?.user) return;
    console.log('joining user channel');
    refresh();
    socket.emit('join', `user:${auth.value.user.id}`);
    socket.on('usage', creditsChangedListener);
  });

  onBeforeUnmount(() => {
    if (!auth.value?.user) return;
    console.log('leaving user channel');
    socket.emit('leave', `user:${auth.value.user.id}`);
    socket.off('usage', creditsChangedListener);
  });
</script>

<template>
  <div class="flex flex-col space-y-3">
    <div class="flex px-2">
      <div class="w-full pr-4">
        <div class="opacity-50">Account</div>
        <div class="pr-2 opacity-75">
          <NuxtLinkLocale to="/user/profile" class="hover:underline">
            <span>{{ user?.name }}</span>
            <span>
              <SquareArrowOutUpRightIcon
                class="ml-2 inline-block size-3 stroke-1.5 opacity-60"
              />
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
      <button
        class="w-full rounded-full bg-stone-200/60 px-4 py-2 font-semibold"
      >
        Upgrade to Pro
      </button>
    </div>
  </div>
</template>
