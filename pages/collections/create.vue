<script setup lang="ts">
  /**
   * Collection Create - Create a new collection
   * Route: /collections/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'collection.meta.create.title',
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

  const { createCollection } = useManageCollections();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    try {
      await createCollection(values);
      toast.success({
        description: 'Collection created successfully',
      });
      resetForm();
      await refreshNuxtData('allCollections');
      return await navigateTo('/collections');
    } catch (error: any) {
      toast.error({
        description: 'Ups, something went wrong.',
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
            <FormDescription> Describe the collection in a few words. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Collection</Button>
      </form>
    </div>
  </SectionContainer>
</template>
