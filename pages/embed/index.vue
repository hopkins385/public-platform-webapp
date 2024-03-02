<script setup lang="ts">
  const { $client } = useNuxtApp();
  const { queryDocuments } = useVectorDatabase();

  const query = ref<string>('');
  const result = ref<string>('');
  const metaData = ref<any>(null);
  const sourceNodes = ref<any>(null);
  const pending = ref<boolean>(false);

  const open = ref<boolean>(false);
  const toggleOpen = () => {
    open.value = !open.value;
  };

  const getMyUploads = async () => {
    return await $client.me.getUploads.query();
  };

  const embedDocument = async () => {
    const list = await getMyUploads();
    const response = await $client.embed.embedDocument.query({
      path: list[0].path,
    });
    console.log(response);
  };

  const runQuery = async () => {
    result.value = '';
    pending.value = true;
    const { data, error } = await queryDocuments(query.value);
    query.value = '';
    pending.value = false;
    if (data.value) {
      result.value = data.value?.response || '';
      metaData.value = data.value?.metadata || '';
      sourceNodes.value = data.value?.sourceNodes || '';
    }
  };

  const runExample = async (example: string) => {
    query.value = example;
    await runQuery();
  };

  const examples = [
    'Wer ist Christian Underwood?',
    'Was muss ich verstehen bevor ich loslegen kann?',
    'Was ist das Spannungsfeld?',
    'Was ist das Strategie Kick-Off Meeting?',
    "Was sind die fünf goldenen Regeln für's Strategie Kick-Off Meeting?",
    'Leitfragen für Kundenbedürfnisse & Erwartungen',
    'Erkläre Design Thinking',
    'Was sind die Leitfragen für die Durchführung einer Trendanalyse',
    'Wie kann ich mein Unternehmen Krisenfest aufstellen?',
  ];
</script>

<template>
  <div class="p-10">
    <Input v-model="query" type="text" />
    <div>
      <p
        v-for="(example, index) in examples"
        :key="index"
        class="cursor-pointer"
        @click="runExample(example)"
      >
        {{ example }}
      </p>
    </div>
    <Button class="mt-2" @click="runQuery">Get Answer</Button>
    {{ pending === true ? 'Loading...' : '' }}
    <div class="my-10 max-w-4xl bg-white p-5">
      <p>
        {{ result }}
      </p>
    </div>
    <Button variant="outline" class="mb-10 cursor-pointer" @click="toggleOpen">
      References
    </Button>
    <div v-show="open">
      <div class="hidden">
        <pre>{{ metaData }}</pre>
      </div>
      <div v-for="(node, index) in sourceNodes" :key="index" class="py-2">
        {{ node.text }}
      </div>
      <Button class="mt-3" @click="embedDocument">Embed Document</Button>
    </div>
  </div>
</template>
