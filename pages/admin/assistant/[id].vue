<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'assistant.meta.one.title',
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { setAssistantId, getOneAssistant, updateAssistant } =
    useManageAssistants();
  const { $toast } = useNuxtApp();
  const route = useRoute();

  setAssistantId(route.params.id);
  const { data: assistant, refresh } = await getOneAssistant();

  const assistantFormSchema = toTypedSchema(
    z.object({
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
      systemPrompt: z.string().min(3).max(2500),
      isShared: z.boolean().default(false),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
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
    } catch (error: any) {
      $toast('Error', {
        description: 'Ups, something went wrong.',
        duration: errorDuration,
      });
    }
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Update Assistant"
      subtitle="Updating an existing assistant does only affect new conversations."
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

        <FormField v-slot="{ componentField }" name="systemPrompt">
          <FormItem>
            <FormLabel>
              {{ $t('admin.assistant.form.systemPrompt.label') }}
            </FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" />
            </FormControl>
            <FormDescription>
              {{ $t('admin.assistant.form.systemPrompt.description') }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

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
              If the assistant is shared, it will be available to all users.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Update Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
