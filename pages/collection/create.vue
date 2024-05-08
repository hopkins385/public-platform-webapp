<script setup lang="ts">
  /**
   * Collection Create - Create a new collection
   * Route: /collection/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'collections.meta.create.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Create Collection',
      label: 'Create Collection',
    },
  });

  const createProjectSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      description: z.string().optional().or(z.string().min(3).max(255)),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: createProjectSchema,
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { $toast } = useNuxtApp();
  const { createCollection } = useManageCollections();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      await createCollection(values);
      $toast('Success', {
        description: 'Collection created successfully',
        duration: successDuration,
      });
      resetForm();
      await refreshNuxtData('allCollections');
      return await navigateTo('/collection');
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
    <SectionHeading title="Create Collection" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>
              {{ $t('Collectionname') }}
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="off" />
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
              <Textarea v-bind="componentField" />
            </FormControl>
            <FormDescription>
              Describe the collection in a few words.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Collection</Button>
      </form>
    </div>
  </SectionContainer>
</template>
