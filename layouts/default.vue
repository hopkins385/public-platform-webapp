<script setup lang="ts">
  const route = useRoute();
  const { t } = useI18n();
  const head = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
  });
  const title = computed(() => t(route.meta.title?.toString() ?? 'Website'));

  //   import { useEventListener } from '@vueuse/core';
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
      <Meta v-for="meta in head.meta" :id="meta.id" :key="meta.id" :property="meta.property" :content="meta.content" />
    </Head>
    <!--
    bg-gradient-to-b from-slate-100 via-slate-100 to-slate-50
    -->
    <Body class="bg-stone-50">
      <!--div class="sticky inset-0 z-50 h-[65px] w-full bg-white shadow-md">
        <TopBar />
        style="height: calc(100vh - 65px)"
      </div-->
      <div class="flex h-screen overflow-hidden">
        <!-- Toast -->
        <Toaster position="top-right" />
        <!-- NavBar -->
        <NavBar />
        <!-- Main -->
        <div id="main" class="relative grow overflow-scroll text-slate-800">
          <!--div class="h-16 bg-white shadow-sm">
            <TopBar />
          </div-->
          <slot />
        </div>
      </div>
    </Body>
  </Html>
</template>
