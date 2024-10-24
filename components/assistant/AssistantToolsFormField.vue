<script setup lang="ts">
  const { getAllTools } = useAssistantTools();
  const { data: tools, refresh, status } = await getAllTools({ immediate: false });

  onMounted(() => refresh());
</script>

<template>
  <FormField name="tools">
    <FormItem>
      <div class="mb-4 space-y-2">
        <FormLabel> Functions (optional)</FormLabel>
        <FormDescription> These are the functions the assistant can use. </FormDescription>
      </div>

      <span class="text-sm">{{ status === 'pending' ? 'Loading...' : '' }}</span>
      <span class="text-sm">{{ status === 'error' ? 'Failed to load tools' : '' }}</span>

      <FormField
        v-for="item in tools"
        v-slot="{ value, handleChange }"
        :key="item.id"
        type="checkbox"
        :value="item.id"
        :unchecked-value="false"
        name="tools"
      >
        <FormItem class="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox :checked="value?.includes(item.id)" @update:checked="handleChange" />
          </FormControl>
          <FormLabel class="font-normal"> {{ item.name }} </FormLabel>
        </FormItem>
      </FormField>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
