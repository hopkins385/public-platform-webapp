<script setup lang="ts">
  import { ChevronsDownUpIcon, CheckIcon, LockIcon } from 'lucide-vue-next';

  import { cn } from '@/lib/utils';
  import { Button } from '@/components/ui/button';
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@/components/ui/command';
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';

  import { ModelEnum } from '@/utils/modelEnum';

  const models = [
    {
      value: ModelEnum.GroqLlama4K,
      label: 'Groq Llama 4K',
      premium: false,
    },
    {
      value: ModelEnum.GroqMixtral32K,
      label: 'Groq Mixtral 32K',
      premium: false,
    },
    {
      value: ModelEnum.Mixtral7B,
      label: 'Mixtral MoE 8x7B',
      premium: false,
    },
    { value: ModelEnum.MistralMedium, label: 'Mistral Medium', premium: false },
    { value: ModelEnum.MistralLarge, label: 'Mistral Large', premium: false },
    { value: ModelEnum.ChatGPT3, label: 'ChatGPT 3.5 Turbo', premium: false },
    { value: ModelEnum.ChatGPT4, label: 'ChatGPT 4.0', premium: false },
    {
      value: ModelEnum.Claude3Sonnet,
      label: 'Claude 3 Sonnet',
      premium: false,
    },
    { value: ModelEnum.Claude3Opus, label: 'Claude 3 Opus', premium: false },
    { value: ModelEnum.Luminous, label: 'Luminous', premium: true },
    { value: ModelEnum.Local, label: 'Local', premium: false },
  ];

  const open = ref(false);
  const chatStore = useChatStore();

  // const filterFunction = (list: typeof frameworks, search: string) => list.filter(i => i.value.toLowerCase().includes(search.toLowerCase()))
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-[200px] justify-between"
      >
        {{
          chatStore.model
            ? models.find((model) => model.value === chatStore.model)?.label
            : 'Select Model...'
        }}
        <ChevronsDownUpIcon class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput class="h-9" placeholder="Search Model.." />
        <CommandEmpty>No model found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="model in models"
              :key="model.value"
              :value="model.value"
              @select="
                (ev) => {
                  // if premium model
                  if (model.premium) {
                    // if not premium user
                    /*if (!user.premium) {
                      // show modal
                      $modal.show('premium');
                      // close popover
                      open = false;
                      // return
                      return;
                    }*/
                    return;
                  }
                  if (typeof ev.detail.value === 'string') {
                    chatStore.model = ev.detail.value;
                  }
                  open = false;
                }
              "
            >
              <LockIcon v-if="model.premium" class="mr-2 size-3" />
              {{ model.label }}
              <CheckIcon
                :class="
                  cn(
                    'ml-auto h-4 w-4',
                    chatStore.model === model.value
                      ? 'opacity-100'
                      : 'opacity-0',
                  )
                "
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
