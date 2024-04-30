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

  const { getAllModels } = useLLMs();
  const { data: models } = await getAllModels();

  const open = ref(false);
  const chatStore = useChatStore();

  const selectedModel = computed(() =>
    chatStore.model
      ? models.value?.find((model: any) => model?.apiName === chatStore.model)
          ?.displayName
      : 'Select Model...',
  );

  // const filterFunction = (list: typeof frameworks, search: string) => list.filter(i => i.value.toLowerCase().includes(search.toLowerCase()))
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-[210px] justify-between"
      >
        {{ selectedModel }}
        <ChevronsDownUpIcon class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[210px] p-0">
      <Command>
        <CommandInput class="h-9" placeholder="Search Model.." />
        <CommandEmpty>No model found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="model in models"
              :key="model?.id"
              :value="model?.apiName || ''"
              @select="
                (ev) => {
                  // if premium model
                  if (model?.free === false) {
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
              <LockIcon v-if="!model?.free" class="mr-2 size-3" />
              {{ model?.displayName }}
              <CheckIcon
                :class="
                  cn(
                    'ml-auto h-4 w-4',
                    chatStore.model === model?.apiName
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
