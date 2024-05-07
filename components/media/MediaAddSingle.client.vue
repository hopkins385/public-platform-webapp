<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm, configure } from 'vee-validate';
  import * as z from 'zod';

  configure({
    validateOnBlur: false,
    // validateOnChange: false,
    // validateOnInput: false,
    // validateOnModelUpdate: true,
  });

  const props = defineProps<{
    id: string;
    type: string;
  }>();

  const emits = defineEmits<{
    success: [void];
  }>();

  const isLoading = ref(false);

  const MAX_FILE_SIZE = 15000000;
  const ACCEPTED_TYPES = [
    // pdf
    'application/pdf',
    // doc
    'application/msword',
    // docx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // txt
    'text/plain',
  ];

  const formSchema = toTypedSchema(
    z.object({
      file: z
        .instanceof(File)
        .refine((file) => file?.size <= MAX_FILE_SIZE, {
          message: 'File size must be less than 15 MB',
        })
        .refine((file) => ACCEPTED_TYPES.includes(file?.type), {
          message: 'File type must be pdf, doc, docx or txt',
        }),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
  });

  const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    const { file } = values;
    const { uploadMediaFile } = useManageMedia();
    const data = await uploadMediaFile(file, {
      id: props.id,
      type: props.type,
    });
    isLoading.value = false;
    emits('success');
  });
</script>

<template>
  <form class="w-1/3 space-y-6" @submit="onSubmit">
    <FormField v-slot="{ handleChange, handleBlur }" name="file">
      <FormItem>
        <FormLabel>File</FormLabel>
        <FormControl>
          <Input type="file" @change="handleChange" @blur="handleBlur" />
        </FormControl>
        <FormDescription>
          PDF, TXT or MS Word. Max. 1000 Words.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" variant="outline"> Add File to Knowledge </Button>
  </form>
</template>
