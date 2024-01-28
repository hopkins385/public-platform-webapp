<script setup lang="ts">
  import type { User } from '@prisma/client';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  const { successDuration, errorDuration } = useAppConfig().toast;
  const { updateMe, setUserId } = useManageMyUserProfile();
  const { $toast } = useNuxtApp();

  const isLoading = ref(false);

  const props = defineProps<{
    user: {
      id: User['id'];
      name: User['name'];
      email: User['email'];
      firstName: User['firstName'];
      lastName: User['lastName'];
    };
  }>();

  const emits = defineEmits<{
    refresh: [void];
  }>();

  const userFormSchema = toTypedSchema(
    z.object({
      name: z.string().min(3).max(255),
      firstName: z.string().min(3).max(255),
      lastName: z.string().min(3).max(255),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: userFormSchema,
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    isLoading.value = true;
    // wait for 500 ms to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUserId(props.user.id);
    try {
      await updateMe({
        ...values,
      });
      $toast.success('Success', {
        description: 'Your profile has been updated', // TODO: translate
        duration: successDuration,
      });
      // resetForm();
      emits('refresh');
    } catch (error) {
      $toast.error('Error', {
        description: 'Ups, something went wrong.', // TODO: translate
        duration: errorDuration,
      });
    }
    isLoading.value = false;
  });
</script>

<template>
  <form class="space-y-8" @submit="onSubmit">
    <FormField
      v-slot="{ componentField }"
      name="name"
      :model-value="user?.name ?? ''"
    >
      <FormItem>
        <FormLabel>Full Name</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Full name"
            v-bind="componentField"
            disabled
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField
      v-slot="{ componentField }"
      name="email"
      :model-value="user?.email ?? ''"
    >
      <FormItem>
        <FormLabel>
          <div class="flex items-center">
            Email
            <InfoTip
              text="Your email address is used to log in to your account and to send you important notifications. It cannot be changed."
            />
          </div>
        </FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="email"
            v-bind="componentField"
            disabled
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField
      v-slot="{ componentField }"
      name="firstName"
      :model-value="user?.firstName ?? ''"
    >
      <FormItem>
        <FormLabel>First Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="First name" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField
      v-slot="{ componentField }"
      name="lastName"
      :model-value="user?.lastName ?? ''"
    >
      <FormItem>
        <FormLabel>Last Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Last name" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <LoadingButton :is-loading="isLoading" type="submit">
      Update Profile
    </LoadingButton>
  </form>
</template>
