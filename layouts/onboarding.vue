<script setup lang="ts">
  const head = useLocaleHead({
    addDirAttribute: true,
    identifierAttribute: 'id',
    addSeoAttributes: true,
  });
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
    <Head>
      <Title>Onboarding</Title>
    </Head>
    <Body>
      <div id="main">
        <slot />
      </div>
    </Body>
  </Html>
</template>
