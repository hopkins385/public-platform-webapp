<script setup lang="ts">
  import { useEventListener } from '@vueuse/core';
  const route = useRoute();
  const { t } = useI18n();
  const head = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
  });
  const title = computed(() => t(route.meta.title?.toString() ?? 'Website'));

  // Prevent drag and drop from opening a file in the browser
  // useEventListener(window, 'dragover', (e) => e.preventDefault());
  // useEventListener(window, 'drop', (e) => e.preventDefault());
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
    <Head>
      <Title>{{ title }}</Title>
      <Link
        v-for="link in head.link"
        :id="link.id"
        :key="link.id"
        :rel="link.rel"
        :href="link.href"
        :hreflang="link.hreflang"
      />
      <Meta
        v-for="meta in head.meta"
        :id="meta.id"
        :key="meta.id"
        :property="meta.property"
        :content="meta.content"
      />
    </Head>
    <!--
    bg-gradient-to-b from-slate-100 via-slate-100 to-slate-50
    -->
    <Body class="bg-neutral-100">
      <div class="sticky inset-0 z-50 h-[65px] w-full bg-white shadow-md">
        <TopBar />
      </div>
      <div class="flex overflow-hidden" style="height: calc(100vh - 65px)">
        <!-- Toast -->
        <Toaster position="top-right" />
        <!-- NavBar -->
        <NavBar />
        <!-- Main -->
        <div class="grow overflow-scroll text-slate-800">
          <slot />
        </div>
      </div>
    </Body>
  </Html>
</template>
