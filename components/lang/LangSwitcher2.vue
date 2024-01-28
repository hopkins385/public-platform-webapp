<script setup lang="ts">
  import { ChevronsDownUpIcon, CheckIcon } from 'lucide-vue-next';
  import { cn } from '@/lib/utils';

  const open = ref(false);

  const { locale, locales, setLocale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();

  const availableLocales = computed(() => {
    return locales.value.map((i) => {
      return { label: i.name, code: i.code };
    });
  });

  const changeLanguage = async (langCode: string) => {
    await setLocale(langCode);
    switchLocalePath(langCode);
  };
</script>

<template>
  <div class="absolute right-2 top-2">
    <pre>{{ availableLocales }}</pre>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-[140px] justify-between"
        >
          {{
            locale
              ? availableLocales.find((language) => language.code === locale)
                  ?.label
              : 'Select Language...'
          }}
          <ChevronsDownUpIcon class="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[140px] p-0">
        <Command>
          <CommandEmpty>Language not found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="(language, index) in availableLocales"
                :key="index"
                :value="language.code"
                @select="
                  (ev) => {
                    if (typeof ev.detail.value === 'string') {
                      changeLanguage(ev.detail.value);
                    }
                    open = false;
                  }
                "
              >
                {{ language.label }}
                <CheckIcon
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      locale === language.code ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
