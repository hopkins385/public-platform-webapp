<script setup lang="ts">
  import { useForm, configure } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';

  definePageMeta({
    layout: 'auth',
    title: 'auth.meta.title',
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/',
    },
  });

  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  });

  const isLoading = ref(false);
  const authFailed = ref(false);
  const localePath = useLocalePath();
  const { signIn } = useAuth();

  const formSchema = toTypedSchema(
    z.object({
      email: z.string().max(50).email(),
      password: z.string().min(6).max(50),
    }),
  );

  const form = useForm({
    validationSchema: formSchema,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    isLoading.value = true;
    authFailed.value = false;

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      redirectUrl: '/',
    });

    isLoading.value = false;
    if (!result?.error) {
      return navigateTo(localePath('/'));
    } else {
      authFailed.value = true;
    }
  });

  const google = false;
  const register = false;
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center space-y-4 p-10 lg:px-28">
    <h2 class="text-2xl font-bold">{{ $t('auth.login') }}</h2>
    <span v-if="authFailed" class="text-sm text-destructive">
      {{ $t('auth.error.login') }}
    </span>
    <form class="w-full space-y-2 lg:max-w-sm" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormControl>
            <Input type="email" autocomplete="username" placeholder="Email" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormControl>
            <Input
              type="password"
              autocomplete="current-password"
              :placeholder="$t('Password')"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="h-1"></div>
      <LoadingButton :is-loading="isLoading" type="submit" class="w-full">
        {{ $t('auth.login') }}
      </LoadingButton>
    </form>
    <div v-if="register" class="pt-3 text-sm">
      <p class="opacity-60">
        {{ $t("Don't have an account?") }}
        <NuxtLink :to="localePath({ name: 'register' })" class="underline">
          {{ $t('auth.register') }}
        </NuxtLink>
      </p>
    </div>
    <div v-if="google" class="w-full">
      <div class="flex w-full items-center justify-center px-20 py-2">
        <hr class="w-full" />
        <span class="px-5 text-sm text-slate-500">{{ $t('OR') }}</span>
        <hr class="w-full" />
      </div>
      <div class="h-2"></div>
      <button
        class="mx-auto flex w-full items-center justify-center rounded-md bg-[#4285f4] text-center text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-0 lg:max-w-sm"
        role="button"
        @click="signIn('google')"
      >
        <IconGoogle class="size-10" />
        <span class="flex-1">{{ $t('auth.button.google') }}</span>
      </button>
    </div>
  </div>
</template>
