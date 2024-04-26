<script setup lang="ts">
  /**
   * Workflow Settings - Edit Workflow Settings
   * Route: /project/${projectId}/workflow/${workflowId}/settings
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'workflow.meta.settings.title',
  });

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { projectId, workflowId } = useRoute().params;

  // workflow settings
  const { updateWorkflow, getWorkflowSettings } = useManageWorkflows();
  const { data: workflow, refresh } = await getWorkflowSettings(workflowId);

  // projects
  const { getAllProjects } = useManageProjects();
  const { data: allProjects } = await getAllProjects();
  const projects = computed(() => {
    return allProjects.value?.projects.map((project) => {
      return {
        id: project.id,
        name: project.name,
      };
    });
  });

  const updateWorkflowSchema = toTypedSchema(
    z.object({
      workflowId: z.string().min(3).max(255),
      projectId: z.string().min(3).max(255),
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: updateWorkflowSchema,
    initialValues: {
      workflowId: workflow.value?.id,
      projectId: workflow.value?.projectId,
      name: workflow.value?.name,
      description: workflow.value?.description,
    },
  });

  const { $toast } = useNuxtApp();
  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      await updateWorkflow(values);
      $toast('Success', {
        description: 'Workflow updated successfully',
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
    <SectionHeading title="Edit Workflow Settings" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="projectId">
          <FormItem>
            <FormLabel>
              {{ $t('Project') }}
            </FormLabel>
            <Select :disabled="true" v-bind="componentField">
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
                    :selected="project.id === workflow?.projectId"
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

        <Button type="submit">Update Workflow</Button>
      </form>
    </div>
  </SectionContainer>
</template>
