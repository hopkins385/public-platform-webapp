<script setup lang="ts">
  const files = [{}, {}, {}, {}, {}, {}, {}];
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="(file, index) in files" :key="index">
        <TableCell class="truncate">
          <Skeleton class="h-8 w-full" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
