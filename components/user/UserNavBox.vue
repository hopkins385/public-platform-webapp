<script setup lang="ts">
  const socket = useWebsocket();
  const { data: auth } = useAuth();
  const { getMe } = useManageMyUserProfile();
  const { data: user, refresh } = await getMe({ immediate: false });

  function creditsChangedListener(data: any) {
    console.log('credits changed', data);
    refresh();
  }

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
        <div class="opacity-75">
          <NuxtLinkLocale to="/user/profile" class="hover:underline">
            {{ auth?.user?.name }}
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
        Go Pro
      </button>
    </div>
  </div>
</template>
