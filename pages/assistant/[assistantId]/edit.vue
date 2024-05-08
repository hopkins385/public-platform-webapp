<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';
  import { useDebounceFn } from '@vueuse/core';

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

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { getOneAssistant, updateAssistant } = useManageAssistants();
  const { $toast, $client } = useNuxtApp();
  const { assistantId } = useRoute().params;
  const { data: auth } = useAuth();

  const { data: assistant, refresh } = await getOneAssistant(assistantId);

  //  const { findAllMediaFor } = useManageMedia();
  // const { data: media, refresh: refreshMedia } = await findAllMediaFor({
  //   type: 'assistant',
  //   id: assistant.value?.id,
  // });

  const route = useRoute();
  route.meta.breadcrumb.label =
    'Update - ' + assistant.value?.title || 'Assistant';

  const assistantFormSchema = toTypedSchema(
    z.object({
      teamId: z.string(),
      llmId: z.string().min(3).max(255),
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
      systemPrompt: z.string().min(3).max(6000),
      isShared: z.boolean().default(false),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
      teamId: auth.value?.user.teamId,
      llmId: assistant.value?.llm.id,
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
      $toast('Success', {
        description: 'Assistant updated successfully',
        duration: successDuration,
      });
      await refresh();
    } catch (error: any) {
      $toast('Error', {
        description: 'Ups, something went wrong.',
        duration: errorDuration,
      });
    }
  });
  const systemPrompt = ref(assistant.value?.systemPrompt);

  // const tokenCount = ref(0);
  // const getTokenCount = useDebounceFn(async () => {
  //   const data = await $client.tokenizer.getTokens.query({
  //     content: systemPrompt.value || '',
  //   });
  //   tokenCount.value = data.tokenCount;
  // }, 250);

  // onBeforeMount(async () => {
  //   await getTokenCount();
  // });

  const showLargeLangModal = ref(false);
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
            <FormControl>
              <Input
                type="text"
                placeholder="A very short Title (max 3 words)"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>
              This is the title of the assistant that will be displayed to the
              user.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>
              {{ $t('Description') }}
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="A very short description"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>
              This is the description of the assistant that will be displayed to
              the user.
            </FormDescription>
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
                :initial-display-name="
                  assistant?.llm.displayName ?? 'Select AI Model'
                "
                :id="value"
                @update:id="handleChange"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          v-model="systemPrompt"
          name="systemPrompt"
        >
          <FormItem>
            <FormLabel>
              {{ $t('assistant.form.systemPrompt.label') }}
            </FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" />
            </FormControl>
            <FormDescription>
              {{ $t('assistant.form.systemPrompt.description') }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div>
          <div>Knowledge:</div>
        </div>

        <FormField
          v-slot="{ handleChange, value }"
          type="checkbox"
          name="isShared"
        >
          <FormItem>
            <FormLabel>Shared</FormLabel>
            <FormControl>
              <Switch :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormDescription>
              If the assistant is shared, it will be available to your whole
              organization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Update Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
