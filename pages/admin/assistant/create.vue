<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'assistant.meta.create.title',
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { createAssistant } = useManageAssistants();
  const { $toast } = useNuxtApp();

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
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      const assistant = await createAssistant({
        ...values,
        systemPromptTokenCount: 1, // TODO: calculate token count
      });
      $toast('Success', {
        description: 'Assistant created successfully',
        duration: successDuration,
      });
      resetForm();
      return await navigateTo('/assistant');
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
    <SectionHeading title="Create Assistant" />
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
                placeholder="Title (max 3 words)"
                v-bind="componentField"
              />
            </FormControl>
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
                placeholder="Short description"
                v-bind="componentField"
              />
            </FormControl>
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

        <div class="text-sm">Capababilities<br />tbd</div>
        <div class="text-sm">Knowledge Base<br />tbd</div>

        <FormField
          v-slot="{ handleChange, value }"
          type="checkbox"
          name="isShared"
        >
          <FormItem>
            <FormLabel>Public Shared</FormLabel>
            <FormControl>
              <Switch :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormDescription>
              If the assistant is shared it will also be available to users
              outside of your organisation.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
