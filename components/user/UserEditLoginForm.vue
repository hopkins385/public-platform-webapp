<script setup lang="ts">
  import type { User } from '@prisma/client';
  import { PencilIcon } from 'lucide-vue-next';

  const props = defineProps<{
    user: {
      id: User['id'];
      email: User['email'];
    };
  }>();

  const onSubmit = () => {
    // console.log('submit');
  };
</script>

<template>
  <form class="space-y-8" @submit.prevent="onSubmit">
    <FormField v-slot="{ componentField }" name="email" :model-value="user?.email ?? ''">
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
          <div class="flex">
            <Input type="text" placeholder="email" v-bind="componentField" disabled />
            <div class="flex w-1/2">
              <div class="w-full"></div>
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!--
    <FormField
      v-slot="{ componentField }"
      name="password"
      model-value="dummypassword"
    >
      <FormItem>
        <FormLabel>
          <div class="flex items-center">Password</div>
        </FormLabel>
        <FormControl>
          <div class="flex">
            <div class="relative w-full">
              <Input
                type="password"
                placeholder=""
                v-bind="componentField"
                autocomplete="current-password"
                disabled
              />
            </div>
            <div class="flex w-1/2">
              <div class="w-full"></div>
              <UserEditPasswordDialog />
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    -->
  </form>
</template>
