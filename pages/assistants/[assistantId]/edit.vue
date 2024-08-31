<script setup lang="ts">
  import { useForm } from 'vee-validate';
  import { assistantFormSchema } from '~/schemas/assistant.form';

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

  // const route = useRoute();
  // route.meta.breadcrumb.label = 'Update - ' + assistant.value?.title || 'Assistant';

  const systemPrompt = ref(assistant.value?.systemPrompt || '');

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
      teamId: auth.value?.user.teamId || '-1',
      llmId: assistant.value?.llm.id || '',
      title: assistant.value?.title || '',
      description: assistant.value?.description || '',
      systemPrompt: assistant.value?.systemPrompt || '',
      isShared: assistant.value?.isShared || false,
      functions: ['website'],
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!assistant.value) {
      throw new Error('Assistant not found');
    }
    updateAssistant({
      id: assistant.value.id,
      ...values,
      systemPromptTokenCount: 1, // TODO: calculate token count
    })
      .then(() => {
        toast.success({
          description: 'Assistant updated successfully',
        });
        navigateTo('/assistants');
      })
      .catch((error: any) => {
        toast.error({
          description: error.message,
        });
      });
  });

  const initialAssistantName = computed(() => assistant.value?.llm.displayName ?? 'Select AI Model');
  const initialCollectionName = computed(() => collections.value[0]?.name ?? 'Select Knowledge Collection');

  const availableFunctions = [
    {
      id: 'website',
      label: 'Web Scraper',
      disabled: true,
    },
  ] as const;
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
                :id="value"
                :initial-display-name="initialAssistantName"
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
                  (id: string) => {
                    handleChange(id), updateCollection(id);
                  }
                "
                @reset="resetCollections"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="functions">
          <FormItem>
            <div class="mb-4 space-y-2">
              <FormLabel> Functions (optional)</FormLabel>
              <FormDescription> These are the functions the assistant can use. </FormDescription>
            </div>

            <FormField
              v-for="item in availableFunctions"
              v-slot="{ value, handleChange }"
              :key="item.id"
              type="checkbox"
              :value="item.id"
              :unchecked-value="false"
              name="functions"
            >
              <FormItem class="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    :checked="value?.includes(item.id)"
                    :disabled="item.disabled"
                    @update:checked="handleChange"
                  />
                </FormControl>
                <FormLabel class="font-normal">
                  {{ item.label }}
                </FormLabel>
              </FormItem>
            </FormField>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="isShared">
          <FormItem>
            <FormLabel>Shared</FormLabel>
            <FormDescription>
              If the assistant is shared, it is available to your whole organization. If unshared then it is only
              available to your team.
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
