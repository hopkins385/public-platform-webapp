<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'workflow.meta.create.title',
  });

  const { getAllProjects } = useManageProjects();
  const { data: allProjects } = await getAllProjects();

  const projects = computed(() => {
    // just keep the id and name and remove other fields
    return allProjects.value?.projects.map((project) => {
      return {
        id: project.id,
        name: project.name,
      };
    });
  });

  const createWorkflowSchema = toTypedSchema(
    z.object({
      projectId: z.string().min(3).max(255),
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: createWorkflowSchema,
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { $toast } = useNuxtApp();
  const { createWorkflow } = useManageWorkflows();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      await createWorkflow(values);
      $toast('Success', {
        description: 'Workflow created successfully',
        duration: successDuration,
      });
      resetForm();
      return await navigateTo('/workflow');
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
    <SectionHeading title="Create Workflow" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="projectId">
          <FormItem>
            <FormLabel>
              {{ $t('Project') }}
            </FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="project in projects"
                    :key="project.id"
                    :value="project.id"
                  >
                    {{ project.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>
              {{ $t('Name') }}
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
              This is the description of the workflow.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create Workflow</Button>
      </form>
    </div>
  </SectionContainer>
</template>
