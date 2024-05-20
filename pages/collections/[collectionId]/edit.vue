<script setup lang="ts">
  /**
   * Collection Edit - Edit a collection
   * Route: /collections/${collectionId}/edit
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'collections.meta.update.title',
    breadcrumb: {
      icon: 'database',
      ariaLabel: 'Update Collection',
      label: 'Update Collection',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidCollectionId(route.params);
    },
  });
  const { collectionId } = useRoute().params;
  const { findFirst, updateCollection, setCollectionId } =
    useManageCollections();

  const createCollectionSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      description: z.string().max(255).optional(),
    }),
  );

  const { data: collection, refresh } = await findFirst(collectionId);

  const { handleSubmit } = useForm({
    validationSchema: createCollectionSchema,
    initialValues: {
      name: collection.value?.name,
      description: collection.value?.description || '',
    },
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    try {
      await updateCollection(collectionId, values);
      toast.success({
        description: 'Collection updated successfully',
      });
      await refresh();
    } catch (error: any) {
      toast.error({
        description: 'Ups, something went wrong.',
      });
    }
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Edit Collection" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>
              {{ $t('Collection Name') }}
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
              The description is used by the AI to understand the high level
              purpose of the project.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Update Collection</Button>
      </form>
    </div>
  </SectionContainer>
</template>
