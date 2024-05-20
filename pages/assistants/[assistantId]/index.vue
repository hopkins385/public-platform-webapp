<script setup lang="ts">
  definePageMeta({
    title: 'assistant.meta.edit.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Assistant',
      label: '...',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidAssistantId(route.params);
    },
  });

  const { assistantId } = useRoute().params;
  navigateTo(`/assistants`);
</script>

<template>
  <div></div>
</template>
