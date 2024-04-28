<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'assistant.meta.create.title',
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { createAssistant } = useManageAssistants();
  const { getAllModels } = useLLMs();
  const { $toast } = useNuxtApp();
  const { data: auth } = useAuth();

  const { data: models } = await getAllModels({ lazy: true });

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
    try {
      const assistant = await createAssistant({
        ...values,
        teamId: auth.value?.user.teamId,
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

        <FormField v-slot="{ componentField }" name="llmId">
          <FormItem>
            <FormLabel>
              {{ $t('Ai Model') }}
            </FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an Ai Model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="model in models"
                    :key="model.id"
                    :value="model.id"
                  >
                    {{ model.displayName }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
              If the assistant is shared it will be available to your whole
              organization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Assistant</Button>
      </form>
    </div>
  </SectionContainer>
</template>
