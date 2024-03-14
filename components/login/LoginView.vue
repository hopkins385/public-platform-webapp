<script setup lang="ts">
  import { useForm, configure } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import * as z from 'zod';

  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  });

  const isLoading = ref(false);
  const authFailed = ref(false);
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
    });

    isLoading.value = false;
    if (!result?.error) {
      return navigateTo('/');
    } else {
      authFailed.value = true;
    }
  });

  const google = false;
</script>

<template>
  <div class="h-screen lg:grid lg:grid-cols-2">
    <div class="bg-primary">
      <div class="flex items-center py-5 pl-10">
        <IconSvenson class="size-9" />
        <h1 class="pl-3 text-lg text-slate-300">Svenson.ai</h1>
      </div>
      <div class="mt-40 hidden p-20 text-center text-slate-300 lg:block">
        <p class="text-2xl italic">
          "The best way to understand the limitations of the Human Mind’s
          intelligence is to try to understand what computers can do very well."
        </p>
      </div>
    </div>
    <div
      class="flex flex-col items-center justify-center space-y-4 p-10 lg:px-28"
    >
      <h2 class="text-2xl font-bold">{{ $t('auth.login') }}</h2>
      <span v-if="authFailed" class="text-sm text-destructive">
        {{ $t('auth.error.login') }}
      </span>
      <form class="w-full space-y-2 lg:max-w-sm" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormControl>
              <Input
                type="email"
                autocomplete="username"
                placeholder="Email"
                v-bind="componentField"
              />
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

        <LoadingButton :is-loading="isLoading" type="submit" class="w-full">
          {{ $t('auth.login') }}
        </LoadingButton>
      </form>
      <div v-if="google">
        <div class="flex w-full items-center justify-center px-20 py-2">
          <hr class="w-full" />
          <span class="px-5 text-sm text-slate-500">{{ $t('OR') }}</span>
          <hr class="w-full" />
        </div>
        <button
          class="flex w-full items-center justify-center rounded-md bg-[#4285f4] text-center text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-0 lg:max-w-sm"
          role="button"
          @click="signIn('google')"
        >
          <IconGoogle class="size-10" />
          <span class="-ml-8 flex-1">{{ $t('auth.button.google') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
