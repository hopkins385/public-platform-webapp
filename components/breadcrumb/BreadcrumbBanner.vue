<script setup lang="ts">
  const links = [];
  const route = useRouter();
</script>

<template>
  <template>
    <Breadcrumb>
      <BreadcrumbList>
        <template v-for="(link, index) in links" :key="index">
          <BreadcrumbItem>
            <NuxtLink v-bind="link">{{ link.label }}</NuxtLink>
            <BreadcrumbLink class="hidden" :href="link.to">
              {{ link.label }}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </template>
</template>
