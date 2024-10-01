<script setup lang="ts"></script>

<template>
  <SectionContainer>
    <SectionHeading title="Speech to Text (Preview)" subtitle="Recording stops automatically if you stop talking." />
    <BoxContainer class="w-full">
      <AudioRecorder :show-visualization="true" />
    </BoxContainer>
  </SectionContainer>
</template>
