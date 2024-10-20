<script setup lang="ts">
  import { useForm } from 'vee-validate';
  import { assistantFormSchema } from '~/schemas/assistant.form';

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
  const toast = useToast();

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
      teamId: auth.value?.user.teamId || '-1',
      llmId: '',
      title: '',
      description: '',
      systemPrompt: '',
      isShared: false,
      functions: [],
    },
  });

  const onSubmit = handleSubmit((values, { resetForm }) => {
    createAssistant({
      ...values,
      systemPromptTokenCount: 1,
    })
      .then(() => {
        toast.success({
          description: 'Assistant created successfully',
        });
        resetForm();
        navigateTo('/assistants');
      })
      .catch(() => {
        toast.error({
          description: 'Failed to create assistant',
        });
      });
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
