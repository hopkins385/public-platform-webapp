<script setup lang="ts"></script>

<template>
  <Select default-value="gpt-35-turbo">
    <SelectTrigger class-name="w-[180px]">
      <SelectValue placeholder="Model" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="mistral-light">Mistral Small</SelectItem>
      <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
      <SelectItem value="gpt-35-turbo">ChatGPT 3.5 Turbo</SelectItem>
      <SelectItem value="gpt-40-turbo">ChatGPT 4.0 Turbo</SelectItem>
      <SelectItem value="claude-21-instruct">Claude 2.1 Instruct</SelectItem>
      <SelectItem value="claude-21-chat">Claude 2.1 Chat</SelectItem>
    </SelectContent>
  </Select>
</template>
