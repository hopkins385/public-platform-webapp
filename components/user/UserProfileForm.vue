<script setup lang="ts">
  import type { User } from '@prisma/client';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  defineProps<{
    user: {
      id: User['id'];
      name: User['name'];
      firstName: User['firstName'];
      lastName: User['lastName'];
    };
  }>();

  const emits = defineEmits<{
    refresh: [void];
  }>();

  const { updateMe } = useManageMyUserProfile();

  const userFormSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      firstName: z.string().trim().min(2).max(100),
      lastName: z.string().trim().min(2).max(100),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: userFormSchema,
  });

  const isLoading = ref(false);

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();
    isLoading.value = true;
    try {
      await updateMe({
        ...values,
      });
      toast.success({
        description: 'Your profile has been updated', // TODO: translate
      });
      // resetForm();
      emits('refresh');
    } catch (error) {
      toast.error({
        description: 'Ups, something went wrong.', // TODO: translate
      });
    }
    isLoading.value = false;
  });
</script>

<template>
  <form class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name" :model-value="user?.name ?? ''">
      <FormItem>
        <FormLabel>Full Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Full name" v-bind="componentField" disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="firstName" :model-value="user?.firstName ?? ''">
      <FormItem>
        <FormLabel>First Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="First name" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="lastName" :model-value="user?.lastName ?? ''">
      <FormItem>
        <FormLabel>Last Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Last name" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <LoadingButton variant="outline" :is-loading="isLoading" type="submit"> Update Profile </LoadingButton>
  </form>
</template>
