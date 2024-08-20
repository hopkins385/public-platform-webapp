<script setup lang="ts">
  /**
   * Document Edit - Edit a document
   * Route: /documents/${documentId}/edit
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'document.meta.update.title',
    breadcrumb: {
      icon: 'folder',
      ariaLabel: 'Update Document',
      label: 'Update',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidDocumentId(route.params);
    },
  });

  const projectStore = useProjectStore();

  const { documentId } = useRoute().params;
  const { getDocument } = useManageDocuments();

  const { data: document } = await getDocument(projectStore.activeProjectId, documentId as string);

  const documentName = computed(() => document.value?.name || '');

  const content = document.value?.documentItems.map((item) => item.content).join('<br>') || '';

  const input = ref<string>(content);
</script>

<template>
  <SectionContainer>
    <!--
    <SectionHeadingEditable v-model:title="documentName" v-model:description="documentDescription">
      <template #button>
        <Button variant="outline" aria-label="Save Document" @click="saveDocument"> Save </Button>
      </template>
    </SectionHeadingEditable>
    -->
    <div class="flex flex-col items-center justify-center space-y-8 rounded-lg">
      <div class="w-full">
        <EditorBox v-model="input" />
      </div>
    </div>
  </SectionContainer>
</template>
