<script setup lang="ts">
  /**
   * Component: ImageGenSettings
   */
  import { SlidersHorizontalIcon, RotateCcwIcon } from 'lucide-vue-next';

  const show = ref(false);
  const settings = useImgGenSettingsStore();
</script>

<template>
  <Popover v-model:open="show">
    <PopoverTrigger as-child>
      <Button variant="outline" size="icon" class="group">
        <SlidersHorizontalIcon class="size-5 stroke-1.5 text-primary/70 group-hover:stroke-2" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="mt-1 w-72 text-sm">
      <div class="flex items-center justify-between">
        <span>Settings</span>
        <button @click="settings.resetSettings()">
          <RotateCcwIcon class="size-3 opacity-60" />
        </button>
      </div>
      <Separator class="my-3" />
      <div class="my-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>Images</div>
          <div>{{ settings.getImageCount }}</div>
        </div>
        <Slider v-model="settings.imageCount" :default-value="[4]" :min="1" :max="4" :step="1" class="slider" />
      </div>
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>Image Width</div>
          <div>{{ settings.getImageWidth }}</div>
        </div>
        <Slider
          v-model="settings.imageWidth"
          :default-value="[1024]"
          :min="512"
          :max="1440"
          :step="32"
          class="slider"
        />
      </div>
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>Image Height</div>
          <div>{{ settings.getImageHeight }}</div>
        </div>
        <Slider
          v-model="settings.imageHeight"
          :default-value="[1024]"
          :min="512"
          :max="1440"
          :step="32"
          class="slider"
        />
      </div>
      <div class="mb-5 flex flex-col space-y-4">
        <div class="flex w-full justify-between">
          <div>
            Guidance
            <InfoTooltip
              title="Guidance scale"
              content="High guidance scale improves prompt adherence at the cost of reduced realism."
            />
          </div>
          <div>{{ settings.getImageGuidance }}</div>
        </div>
        <Slider
          v-model="settings.imageGuidance"
          :default-value="[2.5]"
          :min="1.5"
          :max="5"
          :step="0.5"
          class="slider"
        />
      </div>
      <div class="flex flex-col">
        <div>
          Prompt Upsampling
          <InfoTooltip
            title="Prompt Upsampling"
            content="Whether to perform upsampling on the prompt. If active, automatically modifies the prompt for more creative generation."
          />
        </div>
        <Switch
          class="-ml-2 mt-1 scale-75"
          :checked="settings.promptUpsampling"
          @update:checked="(val) => (settings.promptUpsampling = val)"
        />
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
