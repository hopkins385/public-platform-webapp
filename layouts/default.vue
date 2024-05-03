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
    <Body>
      <div class="flex h-screen overflow-hidden">
        <!-- Toast -->
        <Toaster position="top-right" />
        <!-- Sidebar -->
        <div class="w-20 shrink-0 border-0 shadow-md">
          <NavBar />
        </div>
        <!-- Main -->
        <div
          class="grow overflow-scroll bg-gradient-to-b from-slate-100 to-slate-50 text-slate-800"
        >
          <slot />
        </div>
      </div>
    </Body>
  </Html>
</template>
