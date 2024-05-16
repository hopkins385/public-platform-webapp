<script setup lang="ts">
  import { PlusIcon } from 'lucide-vue-next';

  definePageMeta({
    title: 'document.meta.index.title',
    breadcrumb: {
      icon: 'file',
      ariaLabel: 'Documents',
      label: 'Documents',
    },
  });

  const { createDocument } = useManageDocuments();

  async function onNewDocument() {
    const document = await createDocument({
      projectId: '',
      name: 'Untitled Document',
      description: '',
      status: 'draft',
    });
    await navigateTo(`/document/${document.id}/edit`);
  }
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Documents"
      subtitle="Create, edit, and manage documents"
    />
    <Heading>
      <template #top> </template>
      <template #bottom>
        <div class="ml-auto flex flex-col space-y-1 self-end px-3 pb-2 pt-14">
          <Button @click="() => onNewDocument()">
            New Document
            <PlusIcon class="ml-2 size-4 stroke-2" />
          </Button>
        </div>
      </template>
    </Heading>
    <BoxContainer>
      <div>Document Index</div>
    </BoxContainer>
  </SectionContainer>
</template>
