<script setup lang="ts">
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
      <LangSwitcher class="text-secondary lg:text-primary" />
      <div>
        <slot />
      </div>
    </Body>
  </Html>
</template>
