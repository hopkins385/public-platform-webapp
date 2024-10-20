<script setup lang="ts">
  /**
   * Workflow Create - Create a new workflow
   * Route: /projects/${projectId}/workflows/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm, configure } from 'vee-validate';
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

  const allowedMimeTypes = [
    'application/json',
    // csv
    'text/csv',
    'application/vnd.ms-excel',
    'application/csv',
    // xlsx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const acceptMimeTypes = allowedMimeTypes.join(',');
  const maxFileSize = 1 * 1024 * 1024; // 1MB

  const isLoading = ref(false);

  const errorAlert = reactive({
    show: false,
    message: '',
  });

  const toast = useToast();
  const { projectId } = useRoute().params;
  const { getProject } = useManageProjects();
  const { getAllAssistants } = useManageAssistants();
  const { data: project } = await getProject(projectId);
  const { data: assistantsData } = await getAllAssistants();

  const assistantId = computed(() => assistantsData.value?.assistants[0]?.id || undefined);

  if (!project.value) {
    throw new Error('Project not found');
  }

  if (!assistantId.value) {
    errorAlert.show = true;
    errorAlert.message = 'Please create an assistant first, before creating a workflow.';
  }
  const { getFileSizeForHumans } = useForHumans();
  const createWorkflowSchema = toTypedSchema(
    z.object({
      projectId: z.string().min(3).max(255),
      assistantId: z.string().min(3).max(255),
      projectName: z.string().min(3).max(255),
      name: z.string().min(3).max(255),
      description: z.string().min(3).max(255),
      file: z
        .instanceof(File)
        .refine((file) => allowedMimeTypes.includes(file.type), {
          message: 'Invalid file type.',
        })
        .refine((file) => file.size <= maxFileSize, {
          message: `File too large. Max file size is ${getFileSizeForHumans(maxFileSize)}`,
        })
        .optional(),
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

  const { createWorkflow, reCreateWorkflowFromMedia } = useManageWorkflows();
  const { uploadManyFiles, attachMediaTo } = useManageMedia();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    isLoading.value = true;
    const file = values.file;
    try {
      const workflow = await createWorkflow({
        projectId: values.projectId,
        assistantId: values.assistantId,
        name: values.name,
        description: values.description,
      });

      if (file) {
        // handle file upload
        const medias = await uploadManyFiles([file]);
        const mediaId = medias?.[0].id;
        if (!mediaId) {
          throw new Error('Workflow created but unable to upload file');
        }
        const mediaAbleModel = {
          id: workflow.id,
          type: 'workflow',
        };
        const mediaAble = await attachMediaTo(mediaId, mediaAbleModel);
        const updatedWorkflow = await reCreateWorkflowFromMedia({
          workflowId: workflow.id,
          mediaId: mediaId,
        });
      }

      toast.success({
        description: 'Workflow created successfully',
      });
      resetForm();
      const localePath = useLocalePath();
      return await navigateTo(localePath(`/projects/${project.value?.id}/workflows/${workflow?.id}`));
    } catch (error: any) {
      errorAlert.show = true;
      errorAlert.message = error.message;
    } finally {
      isLoading.value = false;
    }
  });

  configure({
    validateOnBlur: true,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  });
</script>

<template>
  <SectionContainer>
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <SectionHeading title="Create Workflow" />
    <div class="rounded-lg border bg-white p-10">
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="projectName">
          <FormItem>
            <FormLabel>
              {{ $t('Project') }}
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="off" disabled />
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
            <FormDescription> This is the description of the workflow. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- upload/attach file -->
        <FormField v-slot="{ handleChange }" name="file">
          <FormItem>
            <FormLabel>
              {{ $t('Create from File') }}
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                :accept="acceptMimeTypes"
                @change="(event: any) => handleChange(event.target.files && event.target.files[0])"
              />
            </FormControl>
            <FormDescription>
              Supported file types .csv, .xls, .xlsx. Size max
              {{ getFileSizeForHumans(maxFileSize) }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="pt-5">
          <LoadingButton :is-loading="isLoading" type="submit">Create Workflow</LoadingButton>
        </div>
      </form>
    </div>
  </SectionContainer>
</template>
