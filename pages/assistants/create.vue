<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'assistant.meta.create.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Create Assistant',
      label: 'Create',
    },
  });

  const { createAssistant } = useManageAssistants();
  const { data: auth } = useAuth();

  const assistantFormSchema = toTypedSchema(
    z.object({
      title: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
      llmId: z.string().min(3).max(255),
      systemPrompt: z.string().min(3).max(2500),
      isShared: z.boolean().default(false),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    try {
      const assistant = await createAssistant({
        ...values,
        teamId: auth.value?.user.teamId,
        systemPromptTokenCount: 1, // TODO: calculate token count
      });
      toast.success({
        description: 'Assistant created successfully',
      });
      resetForm();
      return await navigateTo('/assistants');
    } catch (error: any) {
      toast.error({
        description: 'Ups, something went wrong.',
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
              <Input type="text" placeholder="Title (max 3 words)" v-bind="componentField" />
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
              <Input type="text" placeholder="Short description" v-bind="componentField" />
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
              <LlmSelectModal :id="value" initial-display-name="Select AI Model" @update:id="handleChange" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="systemPrompt">
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

        <div class="hidden text-sm">Capababilities<br />tbd</div>
        <div class="hidden text-sm">Knowledge Base<br />tbd</div>

        <FormField v-slot="{ handleChange, value }" type="checkbox" name="isShared">
          <FormItem>
            <FormLabel>Shared</FormLabel>
            <FormControl>
              <Switch :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormDescription>
              If the assistant is shared it will be available to your whole organization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
