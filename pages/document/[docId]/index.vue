<script setup lang="ts">
  const route = useRoute();
  const { parseDocument } = useManageDocuments();
  const { data } = await parseDocument(route.params.docId);
</script>

<template>
  <pre>
  {{ data }}
</pre
  >
  <div>Document Index</div>
</template>
