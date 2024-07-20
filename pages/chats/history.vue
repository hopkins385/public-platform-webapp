<script setup lang="ts">
  definePageMeta({
    title: 'chat.meta.history.title',
    breadcrumb: {
      icon: 'chat',
      ariaLabel: 'Chat History',
      label: 'Chat History',
    },
    validate: (route) => {
      const validator = useRouteValidation();
      return validator.hasValidPage(route.query);
    },
  });

  const router = useRouter();
  const route = useRoute();
  const page = ref(route.query.page ? parseInt(route.query.page as string) : 1);

  function setRoutePage(value: number) {
    page.value = value;
    const query = { ...route.query, page: value.toString() };
    router.push({ query });
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Chat History" subtitle="Here you can see all your recent chats" />
    <Suspense>
      <ChatHistory :page="page" @update:page="setRoutePage" />
      <template #fallback>
        <BoxContainer>
          <TableSkeleton />
        </BoxContainer>
      </template>
    </Suspense>
  </SectionContainer>
</template>
