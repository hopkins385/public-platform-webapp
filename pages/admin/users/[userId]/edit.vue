<script setup lang="ts">
  /**
   * Admin Users Create
   * Route: /admin/users/${userId}/edit
   */
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';
  import * as z from 'zod';

  definePageMeta({
    title: 'admin.meta.users.edit.title',
    middleware: 'is-admin',
    breadcrumb: {
      icon: 'admin',
      ariaLabel: 'Edit User',
      label: 'Edit User',
    },
  });

  const { userId } = useRoute().params;

  const toast = useToast();
  const errorAlert = ref({ show: false, message: '' });
  const showUserNowAdminAlert = ref(false);

  const { updateUser, getUser, setUserId } = useAdminUsers();

  setUserId(userId);
  const { data: user } = await getUser();

  const userIsAdmin = computed(() => user.value?.roles?.[0]?.role.name === 'admin');

  const assistantFormSchema = toTypedSchema(
    z.object({
      userId: z.string(),
      firstName: z.string().min(3).max(255),
      lastName: z.string().min(3).max(255),
      email: z.string().email(),
      isAdmin: z.boolean().default(false),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: assistantFormSchema,
    initialValues: {
      userId: user.value?.id,
      firstName: user.value?.firstName || '',
      lastName: user.value?.lastName || '',
      email: user.value?.email,
      isAdmin: userIsAdmin.value,
    },
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    showUserNowAdminAlert.value = false;
    try {
      const user = await updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        isAdmin: values.isAdmin,
      });
      toast.success({
        description: 'User updated successfully',
      });
      if (!userIsAdmin.value && values.isAdmin) {
        showUserNowAdminAlert.value = true;
      }
      // await navigateTo('/admin/users');
      // resetForm();
    } catch (error: any) {
      errorAlert.value.show = true;
      errorAlert.value.message = error?.message || 'An error occurred';
    }
  });
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Edit User"
      subtitle="Update user information
    "
    />
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
        <AdminUsersAlert v-if="showUserNowAdminAlert">
          The user needs to log out and log back in to be able to access admin features.
        </AdminUsersAlert>

        <Button type="submit">Update User</Button>
      </form>
    </BoxContainer>
  </SectionContainer>
</template>
