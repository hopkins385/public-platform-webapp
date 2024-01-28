<script setup lang="ts">
  const img = useImage();
  const backgroundStyles = computed(() => {
    const imgUrl = img('/images/bg_1.jpeg', {
      height: 2000,
      quality: 100,
      format: 'webp',
    });
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,.20),rgba(0,0,0,.20)), url('${imgUrl}')`,
      backgroundSize: 'cover',
    };
  });
</script>

<template>
  <section>
    <div :style="backgroundStyles" class="h-60"></div>
    <div class="-mt-60 h-screen p-10">
      <slot />
    </div>
  </section>
</template>
