<script setup lang="ts">
  const { getAllDocuments } = useManageDocuments();
  const { data } = await getAllDocuments();
</script>

<template>
  <pre>
  {{ data }}
</pre
  >
  <div>Document Index</div>
</template>
