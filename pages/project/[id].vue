<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'project.meta.create.title',
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { getProject, updateProject } = useManageProjects();

  const createProjectSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    }),
  );

  const route = useRoute();
  const { data: project, refresh } = await getProject(route.params.id);

  const { handleSubmit } = useForm({
    validationSchema: createProjectSchema,
    initialValues: {
      name: project.value?.name,
      description: project.value?.description,
    },
  });

  const { $toast } = useNuxtApp();
  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      await updateProject(values);
      $toast('Success', {
        description: 'Project updated successfully',
        duration: successDuration,
      });
      refresh();
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
    <SectionHeading title="Edit Project" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>
              {{ $t('Project Name') }}
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

        <Button type="submit">Update Project</Button>
      </form>
    </div>
  </SectionContainer>
</template>
