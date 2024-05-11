<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import { z } from 'zod';

  const props = defineProps<{
    assistants: any[] | undefined | null;
    assistantId: string;
    workflowStepId: string;
  }>();

  const emit = defineEmits<{
    refresh: [void];
  }>();

  const formSchema = toTypedSchema(
    z.object({
      assistantId: z.string(),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      assistantId: props.assistantId,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const { updateWorkflowStepAssistant } = useManageWorkflowSteps();
    await updateWorkflowStepAssistant({
      workflowStepId: props.workflowStepId,
      assistantId: values.assistantId,
    });
    emit('refresh');
  });
</script>

<template>
  <FormField
    :value="assistantId"
    v-slot="{ componentField }"
    name="assistantId"
    @update:model-value="() => onSubmit()"
  >
    <FormItem>
      <Select v-bind="componentField">
        <FormControl>
          <SelectTrigger class="text-xs focus:ring-0">
            <SelectValue class="truncate" placeholder="Set Assistant" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="assistant in assistants"
              :key="assistant?.id"
              :value="assistant?.id"
              class="text-xs"
            >
              {{ assistant?.title }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
