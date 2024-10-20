<script setup lang="ts">
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';

  const localePath = useLocalePath();
  const { register } = useRegister();
  const { signIn } = useAuth();

  const formError = ref<string | null>(null);

  const registrationFormSchema = toTypedSchema(
    z.object({
      firstName: z.string().min(2).max(40),
      lastName: z.string().min(2).max(40),
      email: z.string().email(),
      password: z.string().min(8).max(40),
      terms: z.boolean(),
    }),
  );

  const { handleSubmit } = useForm({
    validationSchema: registrationFormSchema,
  });

  const isLoading = ref(false);
  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    formError.value = null;
    isLoading.value = true;
    const { error } = await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      terms: values.terms,
    });
    if (error.value) {
      isLoading.value = false;
      formError.value = error.value.message;
    } else {
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: true,
      });
      resetForm();
      isLoading.value = false;
    }
  });
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center space-y-8 p-10 lg:px-28">
    <h2 class="text-2xl font-bold">{{ $t('auth.register') }}</h2>
    <div v-if="formError" class="text-sm text-destructive">{{ formError }}</div>
    <form class="w-full space-y-3 lg:max-w-sm" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="firstName">
        <FormItem>
          <FormControl>
            <Input
              type="name"
              autocomplete="given-name"
              :placeholder="$t('register.first_name')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="lastName">
        <FormItem>
          <FormControl>
            <Input
              type="name"
              autocomplete="family-name"
              :placeholder="$t('register.last_name')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormControl>
            <Input type="email" autocomplete="username" :placeholder="$t('register.email')" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormControl>
            <Input
              type="password"
              autocomplete="new-password"
              :placeholder="$t('register.password')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ value, handleChange }" name="terms">
        <FormItem>
          <FormControl>
            <Checkbox :checked="value" @update:checked="handleChange" />
            <label for="terms" class="pl-2 text-sm leading-none opacity-80">
              {{ $t('I accept the') }}
              <a href="https://svenson.ai/terms" class="underline">
                {{ $t('terms and conditions') }}
              </a>
            </label>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="h-2"></div>
      <LoadingButton :is-loading="isLoading" type="submit" class="w-full">
        {{ $t('auth.register') }}
      </LoadingButton>
    </form>
    <div class="text-sm">
      <p class="opacity-60">
        {{ $t('Already have an account?') }}
        <NuxtLink :to="localePath({ name: 'login' })" class="underline">
          {{ $t('auth.login') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
