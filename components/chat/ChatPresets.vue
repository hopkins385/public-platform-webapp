<script setup lang="ts">
  const presets = [
    {
      id: 1,
      title: 'Erstellen',
      description:
        'Erstelle mir eine Liste mit Hobbys, denen ich in meiner knappen Freizeit nachgehen kann',
      prompt:
        'Erstelle mir eine Liste mit Hobbys, denen ich in meiner knappen Freizeit nachgehen kann.',
      icon: 'clipboard',
    },
    {
      id: 1,
      title: 'Reisen',
      description:
        'Was sollte ich für eine zehntägige Reise in eine Bergregion einpacken?',
      prompt:
        'Was sollte ich für eine zehntägige Reise in eine Bergregion einpacken?',
      icon: 'map',
    },
    {
      id: 1,
      title: 'Einkaufen',
      description:
        'Ich brauche ein Geschenk für meinen Freund, der gerne bei kaltem Wetter wandert',
      prompt:
        'Ich brauche ein Geschenk für meinen Freund, der gerne bei kaltem Wetter wandert.',
      icon: 'gift',
    },
    {
      id: 1,
      title: 'Schreiben',
      description:
        'Schreibe eine schöne Fabel über einen Fisch und einen Frosch, die sich lieben',
      prompt:
        'Schreibe eine schöne Fabel über einen Fisch und einen Frosch, die sich lieben.',
      icon: 'text',
    },
    {
      id: 1,
      title: 'Programmieren',
      description:
        'Erstelle ein Python Programm, das die ersten 100 Primzahlen ausgibt',
      prompt:
        'Erstelle ein Python Programm, das die ersten 100 Primzahlen ausgibt.',
      icon: 'code',
    },
    {
      id: 1,
      title: 'Kochen',
      description:
        'Erstell mir ein Rezept für ein leckeres Gericht mit Kartoffeln inklusive Einkaufsliste',
      prompt:
        'Erstell mir ein Rezept für ein leckeres Gericht mit Kartoffeln inklusive Einkaufsliste.',
      icon: 'cook',
    },
  ];

  defineEmits<{
    clicked: [string];
  }>();
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="grid w-fit grid-cols-3 gap-8">
      <ChatPresetBox
        v-for="(preset, index) in presets"
        :key="index"
        :title="preset.title"
        :icon-name="preset.icon"
        @click="() => $emit('clicked', preset.prompt)"
      >
        {{ preset.description }}
      </ChatPresetBox>
    </div>
  </div>
</template>
