<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { LoaderCircleIcon } from 'lucide-vue-next';
  import { useForm, configure } from 'vee-validate';
  import { Trash2Icon } from 'lucide-vue-next';
  import * as z from 'zod';

  const props = defineProps<{ userId: string }>();

  const open = ref(false);
  const showConfirm = ref(false);
  const isLoading = ref(false);

  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  });

  const passwordSchema = toTypedSchema(
    z.object({
      userId: z.string(),
      password: z.string().min(6).max(100),
    }),
  );

  const { handleSubmit, setErrors } = useForm({
    validationSchema: passwordSchema,
    initialValues: {
      userId: props.userId,
      password: '',
    },
  });

  const { deleteMe } = useManageMyUserProfile();
  const { signOut } = useAuth();

  const onSubmit = handleSubmit(async (values, { resetForm }) => {
    isLoading.value = true;
    try {
      await deleteMe(values);
    } catch (error) {
      isLoading.value = false;
      setErrors({ password: 'Password wrong' });
      return;
    }
    await signOut();
    await navigateTo('/login');
  });

  function onCancel() {
    showConfirm.value = false;
    open.value = false;
  }

  function onDelete() {
    showConfirm.value = true;
  }
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" class="flex items-center space-x-2">
        <Trash2Icon class="size-4 stroke-1.5 text-destructive" />
        <span>Delete account</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogDescription> </DialogDescription>
      </DialogHeader>

      <div>
        Are you sure you want to delete your account?<br />
        This action cannot be undone.
      </div>

      <div v-show="showConfirm">
        <form @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>
                <div class="flex items-center">Please enter your password</div>
              </FormLabel>
              <FormControl>
                <div class="flex">
                  <div class="relative w-full">
                    <Input
                      type="password"
                      placeholder=""
                      v-bind="componentField"
                      autocomplete="off"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </div>

      <DialogFooter as-child>
        <div class="space-x-2" v-if="!showConfirm">
          <Button variant="outline" @click="onCancel">Cancel</Button>
          <Button variant="outline" @click="onDelete">Delete</Button>
        </div>
        <div v-else class="space-x-2">
          <Button
            variant="outline"
            class="space-x-2"
            @click="onSubmit"
            :disabled="isLoading"
          >
            <LoaderCircleIcon v-if="isLoading" class="size-4 animate-spin" />
            <span> Delete Account</span>
          </Button>
          <Button variant="outline" @click="onCancel">Cancel</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
