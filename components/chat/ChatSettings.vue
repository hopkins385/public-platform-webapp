<script setup lang="ts">
  /**
   * Component: ChatSettings
   */
  import { SlidersHorizontalIcon, RotateCcwIcon } from 'lucide-vue-next';

  const props = defineProps<{
    assistantId: string;
  }>();

  const show = ref(false);
  const settings = useChatSettingsStore();

  const presencePenalty = false;

  function onEditAssistantClick() {
    if (!props.assistantId) return;
    navigateTo(`/assistants/${props.assistantId}/edit`);
  }
</script>

<template>
  <Popover v-model:open="show">
    <PopoverTrigger as-child>
      <Button variant="outline" size="icon" class="group">
        <SlidersHorizontalIcon class="size-4 stroke-1.5 text-primary/70 group-hover:stroke-2" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="mt-1 w-60 text-sm">
      <div class="flex items-center justify-between">
        <span>Chat {{ $t('chat.settings.title') }}</span>
        <button @click="settings.resetSettings()">
          <RotateCcwIcon class="size-3 opacity-60" />
        </button>
      </div>
      <Separator class="my-3" />
      <Button variant="outline" size="sm" class="w-full" @click="onEditAssistantClick"> Edit Assistant </Button>
      <Separator class="my-3" />
      <div class="my-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            {{ $t('chat.settings.temperature.title') }}
            <InfoTooltip
              :title="$t('chat.settings.temperature.title')"
              :content="$t('chat.settings.temperature.description')"
            />
          </div>
          <div>{{ settings.getTemperature }}</div>
        </div>
        <Slider v-model="settings.temperature" :default-value="[20]" :max="100" :step="1" class="slider" />
      </div>
      <div v-if="presencePenalty" class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            {{ $t('chat.settings.presencePenalty.title') }}

            <InfoTooltip
              :title="$t('chat.settings.presencePenalty.title')"
              :content="$t('chat.settings.presencePenalty.description')"
            />
          </div>
          <div>{{ settings.getPresencePenalty }}</div>
        </div>
        <Slider
          v-model="settings.presencePenalty"
          :default-value="[0]"
          :min="-200"
          :max="200"
          :step="1"
          class="slider"
        />
      </div>
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            {{ $t('chat.settings.maxTokens.title') }}
            <InfoTooltip
              :title="$t('chat.settings.maxTokens.title')"
              :content="$t('chat.settings.maxTokens.description')"
            />
          </div>
          <div>{{ settings.getMaxTokens }}</div>
        </div>
        <Slider v-model="settings.maxTokens" :default-value="[500]" :max="3500" :step="1" class="slider" />
      </div>
      <div class="flex flex-col">
        <div>
          {{ $t('chat.settings.onEnterSubmit.title') }}
          <InfoTooltip
            :title="$t('chat.settings.onEnterSubmit.title')"
            :content="$t('chat.settings.onEnterSubmit.description')"
          />
        </div>
        <Switch
          class="-ml-2 mt-1 scale-75"
          :checked="settings.submitOnEnter"
          @update:checked="(val) => (settings.submitOnEnter = val)"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style>
  .slider {
    @apply [&_[role=slider]]:size-4 [&_[role=slider]]:border [&_[role=slider]]:hover:cursor-grab [&_[role=slider]]:active:cursor-grabbing;
  }
</style>
