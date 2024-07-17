<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'assistant.meta.edit.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Update Assistant',
      label: 'Update',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidAssistantId(route.params);
    },
  });

  const { assistantId } = useRoute().params;
  const { data: auth } = useAuth();
  const toast = useToast();

  console.log('assistantId', assistantId);

  const assistantModel = ref({
    type: 'assistant',
    id: assistantId as string,
  });

  const { getOneAssistant, updateAssistant } = useManageAssistants();
  const { data: assistant, refresh } = await getOneAssistant(assistantId);

  const { findAllFor } = useManageCollections();
  const { data: collections, refresh: refreshCollections } = await findAllFor(assistantModel.value, { lazy: false });

  async function updateCollection(collectionId: string) {
    const { replaceCollectionTo } = useManageCollectionAbles();
    await replaceCollectionTo(assistantModel.value, collectionId);
    await refreshCollections();
    toast.success({
      description: 'Collection updated successfully',
    });
  }

  async function resetCollections() {
    const { detachAllCollectionsFor } = useManageCollectionAbles();
    await detachAllCollectionsFor(assistantModel.value);
    await refresh();
    await refreshCollections();
    toast.success({
      description: 'Collection updated successfully',
    });
  }

  const route = useRoute();
  route.meta.breadcrumb.label = 'Update - ' + assistant.value?.title || 'Assistant';

  const systemPrompt = ref(assistant.value?.systemPrompt);

  const assistantFormSchema = toTypedSchema(
    z.object({
      teamId: z.string(),
      llmId: z.string().min(3).max(255),
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
      systemPrompt: z.string().min(3).max(6000),
      isShared: z.boolean().default(false),
      collectionId: z.string().optional(),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
      teamId: auth.value?.user.teamId,
      llmId: assistant.value?.llm.id || '',
      title: assistant.value?.title,
      description: assistant.value?.description,
      systemPrompt: assistant.value?.systemPrompt,
      isShared: assistant.value?.isShared,
    },
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      if (!assistant.value) {
        throw new Error('Assistant not found');
      }
      await updateAssistant({
        id: assistant.value.id,
        ...values,
        systemPromptTokenCount: 1, // TODO: calculate token count
      });
      toast.success({
        description: 'Assistant updated successfully',
      });
      await refresh();
    } catch (error: any) {
      toast.error({
        description: error.message,
      });
    }
  });

  const initialAssistantName = computed(() => assistant.value?.llm.displayName ?? 'Select AI Model');

  const initialCollectionName = computed(() => collections.value[0]?.name ?? 'Select Knowledge Collection');
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Update Assistant"
      subtitle="Updating an existing assistant does only affect new conversations and workflows."
    />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>
              {{ $t('Title') }}
            </FormLabel>
            <FormDescription> This is the title of the assistant that will be displayed to the user. </FormDescription>
            <FormControl>
              <Input type="text" placeholder="A very short Title (max 3 words)" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>
              {{ $t('Description') }}
            </FormLabel>
            <FormDescription>
              This is the description of the assistant that will be displayed to the user.
            </FormDescription>
            <FormControl>
              <Input type="text" placeholder="A very short description" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" name="llmId">
          <FormItem>
            <FormLabel>
              {{ $t('Ai Model') }}
            </FormLabel>
            <FormControl>
              <LlmSelectModal
                :initial-display-name="initialAssistantName"
                :id="value"
                @update:id="
                  (id) => {
                    handleChange(id), onSubmit();
                  }
                "
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" v-model="systemPrompt" name="systemPrompt">
          <FormItem>
            <FormLabel>
              {{ $t('assistant.form.systemPrompt.label') }}
            </FormLabel>
            <FormDescription>
              {{ $t('assistant.form.systemPrompt.description') }}
            </FormDescription>
            <FormControl>
              <Textarea v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" name="collectionId">
          <FormItem>
            <FormLabel>Knowledge Collections (optional)</FormLabel>
            <FormDescription> These are the knowledge collections that can be used by the assistant. </FormDescription>
            <FormControl>
              <CollectionSelectModal
                :id="value"
                :initial-display-name="initialCollectionName"
                @update:id="
                  (id) => {
                    handleChange(id), updateCollection(id);
                  }
                "
                @reset="resetCollections"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="isShared">
          <FormItem>
            <FormLabel>Shared</FormLabel>
            <FormDescription>
              If the assistant is shared, it will be available to your whole organization.
            </FormDescription>
            <FormControl>
              <Switch :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Update Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
