<script setup lang="ts">
  /**
   * Project Create - Create a new project
   * Route: /projects/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'project.meta.create.title',
    breadcrumb: {
      icon: 'robot',
      ariaLabel: 'Create Project',
      label: 'Create',
    },
  });

  const createProjectSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: createProjectSchema,
  });

  const { createProject } = useManageProjects();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    try {
      await createProject(values);
      toast.success({
        description: 'Project created successfully',
      });
      resetForm();
      await refreshNuxtData('allProjects');
      return await navigateTo('/projects');
    } catch (error: any) {
      toast.error({
        description: 'Ups, something went wrong.',
      });
    }
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Create Project" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>
              {{ $t('Projectname') }}
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
              The description is used by the AI to understand the high level purpose of the project.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Project</Button>
      </form>
    </div>
  </SectionContainer>
</template>
