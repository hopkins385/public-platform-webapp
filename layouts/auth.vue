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
      <Meta v-for="meta in head.meta" :id="meta.id" :key="meta.id" :property="meta.property" :content="meta.content" />
    </Head>
    <Body>
      <MobileWarning v-if="isMobile || isTablet" />
      <!-- LangSwitcher class="text-secondary lg:text-primary" / -->
      <div class="h-screen lg:grid lg:grid-cols-2">
        <div class="bg-primary">
          <div class="flex items-center py-5 pl-10">
            <IconRagna class="size-9" />
            <h1 class="pl-3 text-lg text-slate-300"><span class="font-semibold tracking-wide">RAGNA</span> Cloud</h1>
          </div>
          <div class="mt-40 hidden p-20 text-slate-300 lg:block">
            <p class="text-2xl">Automate engineering tasks reliably at scale</p>
            <div class="pt-4">
              <ul class="space-y-1">
                <li>Requirements Engineering</li>
                <li>Software Engineering</li>
                <li>Quality Assurance</li>
                <li>Data Insights</li>
                <li>Knowledge Collections</li>
                <li>Intern AI Chat</li>
                <li>Fine-Tuned LLMs</li>
                <li>Privacy First</li>
              </ul>
            </div>
          </div>
        </div>
        <slot />
      </div>
    </Body>
  </Html>
</template>
