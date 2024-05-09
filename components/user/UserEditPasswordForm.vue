<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { LoaderCircleIcon } from 'lucide-vue-next';
  import { useForm, configure } from 'vee-validate';
  import * as z from 'zod';

  const emit = defineEmits<{
    closeModal: [void];
  }>();

  const isLoading = ref(false);
  const error = ref<string>('');
  const { $client } = useNuxtApp();

  const passwordFormSchema = toTypedSchema(
    z
      .object({
        password: z.string().min(6).max(100),
        newPassword: z.string().min(6).max(100),
        newPasswordConfirm: z.string().min(6).max(100),
      })
      .refine((data) => data.newPassword === data.newPasswordConfirm, {
        message: 'Passwords do not match',
        path: ['newPasswordConfirm'],
      }),
  );

  const { handleSubmit } = useForm({
    validationSchema: passwordFormSchema,
  });

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    const toast = useToast();

    isLoading.value = true;
    error.value = '';

    $client.me.updatePassword
      .mutate({
        currentPassword: values.password,
        newPassword: values.newPassword,
      })
      .then(() => {
        emit('closeModal');
        toast.success({
          description: 'Your password has been updated', // TODO: translate
        });
      })
      .catch((err) => {
        error.value = err.message;
      })
      .finally(() => {
        isLoading.value = false;
      });
  });

  configure({
    validateOnBlur: false,
  });
</script>

<template>
  <form class="mt-3 space-y-5" @submit="onSubmit">
    <div class="text-sm text-destructive" v-if="error !== ''">
      Error: {{ error }}
    </div>
    <FormField name="password" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Current Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            autocomplete="current-password"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="newPassword" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>New Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            autocomplete="new-password"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="newPasswordConfirm" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Confirm New Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            autocomplete="new-password"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="flex space-x-4 pt-3">
      <div class="w-full"></div>
      <Button
        class="whitespace-nowrap"
        variant="ghost"
        :disabled="isLoading"
        @click="emit('closeModal')"
      >
        Cancel
      </Button>
      <Button class="whitespace-nowrap" variant="outline" :disabled="isLoading">
        <LoaderCircleIcon
          v-if="isLoading"
          class="mr-2 size-4 animate-spin opacity-80"
        />
        Save Password
      </Button>
    </div>
  </form>
</template>
