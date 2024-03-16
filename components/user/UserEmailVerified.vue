<script setup lang="ts">
  import { CheckCircle2Icon, XCircleIcon } from 'lucide-vue-next';

  defineProps<{
    verifiedAt: Date | null;
  }>();
</script>

<template>
  <div>
    <h3 class="pb-2">Email</h3>
    <div class="flex items-center space-x-1">
      <div>
        <CheckCircle2Icon v-if="verifiedAt" class="size-4 text-green-500" />
        <XCircleIcon v-else class="size-4 text-destructive" />
      </div>
      <div>Email {{ verifiedAt ? '' : 'not' }} verified</div>
    </div>
  </div>
</template>
