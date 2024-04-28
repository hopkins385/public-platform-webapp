<script setup lang="ts">
  const { isMobile, isTablet } = useDevice();
  const route = useRoute();
  const { t } = useI18n();
  const head = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
  });
  const title = computed(() => t(route.meta.title?.toString() ?? 'Website'));
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
      <MobileWarning v-if="isMobile || isTablet" />
      <LangSwitcher class="text-secondary lg:text-primary" />
      <div class="h-screen lg:grid lg:grid-cols-2">
        <div class="bg-primary">
          <div class="flex items-center py-5 pl-10">
            <IconSvenson class="size-9" />
            <h1 class="pl-3 text-lg text-slate-300">RAGNA <i>Cloud</i></h1>
          </div>
          <div class="mt-40 hidden p-20 text-center text-slate-300 lg:block">
            <p class="text-2xl italic">
              "The best way to understand the limitations of the Human Mind’s
              intelligence is to try to understand what computers can do very
              well."
            </p>
          </div>
        </div>
        <slot />
      </div>
    </Body>
  </Html>
</template>
