<script setup lang="ts">
  /**
   * Home
   * Route: /
   */
  definePageMeta({
    title: 'home.meta.index.title',
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Welcome to RAGNA Cloud" subtitle="The best way to Automate your Requirements Engineering" />
    <div class="grid max-w-5xl grid-cols-3 gap-5">
      <NuxtLinkLocale to="/workflows">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Workflows</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/documents">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Documents</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/chats">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Chat</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/assistants">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Assistants</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/collections">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">Collections</div>
        </BoxContainer>
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/media">
        <BoxContainer class="hover:shadow-md">
          <div class="h-20 w-60 rounded-lg border-0">File Manager</div>
        </BoxContainer>
      </NuxtLinkLocale>
    </div>
  </SectionContainer>
</template>
