<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import { z } from 'zod';

  const props = defineProps<{
    assistants: any[] | undefined | null;
    assistantId: string;
  }>();

  const formSchema = toTypedSchema(
    z.object({
      //
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      assistantId: props.assistantId,
    },
  });

  const onSubmit = handleSubmit((values) => {
    //
  });
</script>

<template>
  <FormField
    :value="assistantId"
    v-slot="{ componentField }"
    name="assistantId"
  >
    <FormItem>
      <Select v-bind="componentField">
        <FormControl>
          <SelectTrigger class="text-xs">
            <SelectValue
              class="whitespace-nowrap"
              placeholder="Set Assistant"
            />
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
