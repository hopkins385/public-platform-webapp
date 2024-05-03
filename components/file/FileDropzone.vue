<script setup lang="ts">
  import { useDropZone, useMouseInElement } from '@vueuse/core';
  import { FileIcon, PlusIcon, XIcon } from 'lucide-vue-next';
  import { z } from 'zod';

  import type { ZodError } from 'zod';

  const MAX_FILE_SIZE = 15000000;
  const ACCEPTED_TYPES = [
    // pdf
    'application/pdf',
    // doc
    'application/msword',
    // docx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // txt
    'text/plain',
    // csv
    'text/csv',
    // xls
    'application/vnd.ms-excel',
    // xlsx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const props = defineProps<{
    modelValue: File[];
  }>();

  const emits = defineEmits<{
    'update:modelValue': [value: File[]];
  }>();

  const dropZoneRef = ref<HTMLDivElement>();
  const fileListRef = ref<HTMLDivElement>();

  const errors = ref<string | null>(null);
  const files = ref<File[]>(props.modelValue || []);
  const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);
  const { isOutside: mouseIsOutsideList } = useMouseInElement(fileListRef);

  const showPlusIcon = computed(() => {
    return isOverDropZone.value;
  });

  const showFileList = computed(() => {
    return files.value.length > 0;
  });

  const sumSize = computed(() => {
    return files.value.reduce((acc, file) => acc + file.size, 0);
  });

  const zodSchema = z.object({
    file: z
      .instanceof(File)
      .refine((file) => file?.size <= MAX_FILE_SIZE, {
        message: 'File size must be less than 15 MB',
      })
      .refine((file) => ACCEPTED_TYPES.includes(file?.type), {
        message: 'File type must be pdf, doc, docx or txt',
      }),
  });

  const isValidFile = (file: File) => {
    if (
      !file ||
      !file.size ||
      !file.name ||
      !file.type ||
      fileAlreadyInList(file)
    ) {
      return false;
    }
    const result = zodSchema.safeParse({ file });
    if (!result.success) {
      const errorMessages = result.error.message;
      errors.value = JSON.parse(errorMessages).map(
        (error: ZodError) => error.message,
      );
      return false;
    }
    errors.value = null;
    return true;
  };

  const fileAlreadyInList = (file: File) => {
    return files.value.some((f) => f.name === file.name);
  };

  function onDrop(droppedfiles: File[] | null) {
    if (files.value) {
      if (droppedfiles) {
        for (const file of droppedfiles) {
          if (!isValidFile(file)) {
            return;
          }
        }
        files.value.push(...droppedfiles);
      }
    } else {
      files.value = droppedfiles || [];
    }
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onClick = () => {
    if (fileListRef.value && !mouseIsOutsideList.value) return;
    const input = document.createElement('input');
    input.multiple = true;
    input.type = 'file';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const selectedFiles = Array.from(target.files);
        for (const file of selectedFiles) {
          if (!isValidFile(file)) {
            return;
          }
        }
        files.value.push(...selectedFiles);
      }
    };
    input.click();
  };

  const fileSizeToMB = (size: number) => {
    return (size / 1024 / 1024).toFixed(2) + ' MB';
  };

  watch(
    () => files.value,
    (files) => {
      emits('update:modelValue', files);
    },
  );

  watch(
    () => props.modelValue,
    (value) => {
      files.value = value;
    },
  );
</script>

<template>
  <div
    ref="dropZoneRef"
    class="group relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center overflow-y-auto rounded-xl border p-5"
    @click="onClick"
  >
    <div
      v-if="sumSize > 0"
      class="absolute right-4 top-2 text-xs text-slate-500"
    >
      Sum: {{ fileSizeToMB(sumSize) }}
    </div>
    <div v-if="showFileList" ref="fileListRef">
      <ul class="space-y-2">
        <li
          v-for="(file, index) in files"
          :key="index"
          class="flex justify-between rounded-lg border px-4 py-2 transition-all hover:scale-105 hover:bg-gray-100"
        >
          <div class="flex space-x-2">
            <FileIcon class="size-5 stroke-1.5" />
            <span class="max-w-xs truncate md:max-w-lg">
              {{ fileSizeToMB(file.size) }} - {{ file.name }}
            </span>
          </div>
          <div
            class="hover:text-danger ml-3 hover:cursor-pointer"
            @click="files.splice(index, 1)"
          >
            <XIcon class="size-5 stroke-1.5 hover:stroke-2" />
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="flex h-full items-center justify-center text-center">
      <div
        class="flex w-40 flex-col items-center justify-center space-y-2 rounded-lg border-0 border-dashed border-slate-300 p-5 text-slate-400"
      >
        <FileIcon class="size-6 stroke-1.5" />
        <span class="text-sm">
          Click here or<br />
          Drag & Drop</span
        >
      </div>
    </div>
    <div
      v-if="showFileList"
      class="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-center text-slate-500 transition-all group-hover:bg-slate-200"
      :class="{
        'bg-slate-200': showPlusIcon,
      }"
    >
      <PlusIcon class="size-3 stroke-1.5" />
    </div>
    <div v-if="errors" class="text-red-500">
      <p v-for="(error, index) in errors" :key="index">
        {{ error }}
      </p>
    </div>
  </div>
</template>
