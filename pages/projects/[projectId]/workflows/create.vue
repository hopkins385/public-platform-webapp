<script setup lang="ts">
  /**
   * Workflow Create - Create a new workflow
   * Route: /projects/${projectId}/workflows/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'workflow.meta.create.title',
    breadcrumb: {
      icon: 'workflow',
      ariaLabel: 'Create Workflow',
      label: 'Create',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const errorAlert = reactive({
    show: false,
    message: '',
  });

  const { projectId } = useRoute().params;
  const { getProject } = useManageProjects();
  const { getAllAssistants } = useManageAssistants();
  const { data: project } = await getProject(projectId);
  const { data: assistantsData } = await getAllAssistants();

  const assistantId = computed(
    () => assistantsData.value?.assistants[0]?.id || undefined,
  );

  if (!project.value) {
    throw new Error('Project not found');
  }

  if (!assistantId.value) {
    errorAlert.show = true;
    errorAlert.message =
      'Please create an assistant first, before creating a workflow.';
  }

  const createWorkflowSchema = toTypedSchema(
    z.object({
      projectId: z.string().min(3).max(255),
      assistantId: z.string().min(3).max(255),
      projectName: z.string().min(3).max(255),
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: createWorkflowSchema,
    initialValues: {
      projectId: project.value.id,
      assistantId: assistantId.value,
      projectName: project.value.name,
      name: '',
      description: '',
    },
  });

  const { createWorkflow } = useManageWorkflows();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    try {
      const workflow = await createWorkflow(values);
      toast.success({
        description: 'Workflow created successfully',
      });
      resetForm();
      const localePath = useLocalePath();
      return await navigateTo(
        localePath(`/projects/${project.value?.id}/workflows/${workflow?.id}`),
      );
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error.message;
    }
  });
</script>

<template>
  <SectionContainer>
    <ErrorAlert :message="errorAlert.message" v-model="errorAlert.show" />
    <SectionHeading title="Create Workflow" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="projectName">
          <FormItem>
            <FormLabel>
              {{ $t('Project') }}
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                autocomplete="off"
                disabled
              />
            </FormControl>
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
