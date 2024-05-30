<script setup lang="ts">
  /**
   * Admin Users Create
   * Route: /admin/users/create
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'admin.meta.users.create.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Create User',
      label: 'Create User',
    },
  });

  const toast = useToast();
  const errorAlert = ref({ show: false, message: '' });

  const { createUser } = useAdminUsers();

  const assistantFormSchema = toTypedSchema(
    z.object({
      firstName: z.string().min(3).max(255),
      lastName: z.string().min(3).max(255),
      email: z.string().email(),
      password: z.string().optional(),
      isAdmin: z.boolean().default(false),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    try {
      const user = await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        isAdmin: values.isAdmin,
      });
      toast.success({
        description: 'User created successfully',
      });
      resetForm();
      return await navigateTo('/admin/users');
    } catch (error: any) {
      errorAlert.value.show = true;
      errorAlert.value.message = error?.message || 'An error occurred';
    }
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading title="Create User" subtitle="Add a new user to your space" />
    <ErrorAlert v-model="errorAlert.show" :message="errorAlert.message" />
    <BoxContainer>
      <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="firstName">
          <FormItem>
            <FormLabel>
              {{ $t('First Name') }}
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="lastName">
          <FormItem>
            <FormLabel>
              {{ $t('Last Name') }}
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>
              {{ $t('Email') }}
            </FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>
              {{ $t('Password') }}
            </FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- isAdmin -->
        <FormField v-slot="{ value, handleChange }" name="isAdmin">
          <FormItem>
            <FormLabel>
              {{ $t('Is Admin') }}
            </FormLabel>
            <FormControl>
              <Checkbox :checked="value" @update:checked="handleChange" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">Create User</Button>
      </form>
    </BoxContainer>
  </SectionContainer>
</template>
