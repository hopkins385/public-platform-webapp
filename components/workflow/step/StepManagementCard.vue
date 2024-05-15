<script setup lang="ts">
  import { onClickOutside, useEventListener } from '@vueuse/core';
  import { SettingsIcon, Trash2Icon } from 'lucide-vue-next';

  const props = defineProps<{
    projectId: string;
    workflowId: string;
    workflowStep: any;
    allAssistants: any[];
    allWorkflowSteps: any[];
  }>();

  const emits = defineEmits<{
    refresh: [void];
    close: [void];
    'show-settings': [void];
  }>();

  const stepCardRef = ref<HTMLElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);
  const workflowStepName = ref<string>(props.workflowStep.name);

  const steps = computed(() => {
    return props.allWorkflowSteps.filter(
      (step) => step.orderColumn < props.workflowStep.orderColumn,
    );
  });

  const hasSteps = computed(() => steps.value.length > 0);

  const { deleteWorkflowStep, updateWorkflowStepName } =
    useManageWorkflowSteps();

  function onSettingsClick() {
    emits('show-settings');
    emits('close');
    // navigateTo(
    //   `/project/${props.projectId}/workflow/${props.workflowId}/step/${props.workflowStep.id}/settings`,
    // );
  }

  async function onDeleteClick() {
    await deleteWorkflowStep(props.workflowStep.id);
    emits('close');
    emits('refresh');
  }

  async function submitForm() {
    if (!workflowStepName.value || workflowStepName.value === '') return;
    await updateWorkflowStepName(props.workflowStep.id, workflowStepName.value);
    emits('refresh');
  }

  function setFocus() {
    if (inputRef.value) {
      inputRef.value.select();
      inputRef.value.focus();
    }
  }

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      emits('close');
    }
  });

  onMounted(() => {
    setFocus();
  });
</script>

<template>
  <div
    :key="workflowStep?.assistant?.id"
    ref="stepCardRef"
    class="w-96 rounded-2xl border bg-white px-4 py-2 text-xs shadow-md"
  >
    <div class="flex flex-col">
      <form @submit.prevent="submitForm">
        <input
          ref="inputRef"
          type="text"
          v-model="workflowStepName"
          class="w-full border-0 py-2 text-xs outline-0"
        />
      </form>
      <hr class="-mx-4 mb-3 mt-1" />
      <div class="space-y-2 py-1">
        <div class="flex justify-between">
          <div>Assistant:</div>
          <span class="hidden">{{ workflowStep?.assistant?.title }}</span>
          <div class="w-40">
            <AssistantSelectForm
              :assistants="allAssistants"
              :assistant-id="workflowStep?.assistant?.id"
              :workflow-step-id="workflowStep?.id"
              @refresh="$emit('refresh')"
            />
          </div>
        </div>
        <div class="flex justify-between">
          <span>LLM:</span>
          <span>{{ workflowStep?.assistant?.llm?.displayName }}</span>
        </div>
        <div class="flex justify-between">
          <span>Document:</span> <span>{{ workflowStep?.document?.name }}</span>
        </div>
        <div v-if="hasSteps">
          <h3 class="pb-1 underline">Inputs:</h3>
          <ul>
            <li v-for="step in steps">- {{ step.name }}</li>
          </ul>
        </div>
      </div>
      <!-- System Prompt -->
      <div class="py-2">
        <FormField
          :value="workflowStep?.assistant?.systemPrompt"
          v-slot="{ componentField }"
          name="bio"
        >
          <FormItem>
            <FormLabel class="text-xs">System Prompt</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Please set an assistant"
                class="resize-none bg-stone-50 text-xs"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <hr class="-mx-4 mb-2 mt-3" />
      <button
        class="w-full rounded-lg border bg-stone-50 px-4 py-2 font-semibold hover:bg-stone-100"
      >
        Run Step
      </button>
      <hr class="-mx-4 mb-2 mt-3" />
      <div>
        <button
          class="group flex cursor-pointer items-center py-2 opacity-75 hover:opacity-100"
          @click="onSettingsClick"
        >
          <SettingsIcon class="mr-1 size-4 stroke-1.5 group-hover:stroke-2" />
          <span class="group-hover:font-semibold">More Settings</span>
        </button>
      </div>
      <div v-if="workflowStep.orderColumn > 0">
        <button
          class="group flex cursor-pointer items-center py-2 opacity-75 hover:opacity-100"
          @click="onDeleteClick"
        >
          <Trash2Icon
            class="mr-1 size-4 stroke-1.5 text-red-500 group-hover:stroke-2"
          />
          <span class="group-hover:font-semibold">Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
