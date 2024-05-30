<script setup lang="ts">
  const { getTokenUsage } = useTokenUsage();
  const { data: usage, error } = await getTokenUsage();
</script>

<template>
  {{ usage }}
  <SectionContainer>
    <BoxContainer>
      <div class="max-w-2xl border">
        <UserUsageBarChart />
      </div>
    </BoxContainer>
  </SectionContainer>
</template>
