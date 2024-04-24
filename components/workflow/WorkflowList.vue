<script setup lang="ts">
  const requirements = [
    {
      id: 1,
      level: 'System',
      content:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      acceptanceCriteria:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      review:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      status:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCase:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCaseStatus:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
    },
    {
      id: 2,
      level: 'System',
      content:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      acceptanceCriteria:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      review:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      status:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCase:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCaseStatus:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
    },
    {
      id: 3,
      level: 'System',
      content:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      acceptanceCriteria:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      review:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio',
      status:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCase:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
      testCaseStatus:
        'The ECU shall be able to monitor and control engine parameters such as air-fuel ratio, ignition timing, and engine temperature.',
    },
  ];
</script>

<template>
  <div class="border-l bg-white p-5">
    <div class="table">
      <div class="row header">
        <div class="cell !hidden">Nr</div>
        <div class="cell">Level</div>
        <div class="cell">Requirement</div>
        <div class="cell">Acceptance Criteria</div>
        <div class="cell">Requirement Review</div>
        <div class="cell">Status</div>
        <div class="cell">Test Case</div>
        <div class="cell">Test Case Review</div>
      </div>
      <div
        v-for="requirement in requirements"
        :key="requirement.id"
        class="row"
      >
        <div class="cell !hidden">Req00{{ requirement.id }}</div>
        <div class="cell">{{ requirement.level }}</div>
        <div class="cell">{{ requirement.content }}</div>
        <div class="cell">{{ requirement.acceptanceCriteria }}</div>
        <div class="cell">{{ requirement.review }}</div>
        <div class="cell">{{ requirement.status }}</div>
        <div class="cell">{{ requirement.testCase }}</div>
        <div class="cell">{{ requirement.testCaseStatus }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .table {
    display: table;
    width: 100%;
    border-collapse: collapse;
    @apply bg-white text-sm;
  }
  .row {
    display: table-row;
  }
  .header {
    font-weight: bold;
    background-color: #f2f2f2;
    @apply whitespace-nowrap;
  }
  .cell {
    display: table-cell;
    @apply max-w-60 truncate border border-gray-200 p-3;
  }

  /* apply a min-w to all cells except for first two */
  .cell:not(:nth-child(1)):not(:nth-child(2)) {
    min-width: 200px;
  }
</style>
