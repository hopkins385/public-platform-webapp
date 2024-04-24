<script setup lang="ts">
  import 'highlight.js/styles/stackoverflow-light.min.css';

  const props = defineProps<{
    message: string;
    role: 'user' | 'assistant';
  }>();

  const messageContentRef = ref<HTMLElement | null>(null);

  function buttonClick(event: Event) {
    console.log('Button clicked');
    // content of the node that the button is attached to
    const content = event.target?.parentNode?.textContent;
    if (content) {
      console.log(content);
    }
  }

  onMounted(() => {
    if (props.role == 'assistant' && messageContentRef.value) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(props.message, 'text/html');
      doc.querySelectorAll('p, li').forEach((el) => {
        el.classList.add('backlog-button-container');
        const button = doc.createElement('button');
        // add id to button
        button.id = 'add-to-backlog-button';
        button.classList.add('add-to-backlog-button');
        button.textContent = '+';
        el.appendChild(button);
      });
      messageContentRef.value.innerHTML = doc.body.innerHTML;

      messageContentRef.value
        .querySelectorAll('#add-to-backlog-button')
        .forEach((button) => {
          button.addEventListener('click', buttonClick);
        });
    }
  });
</script>

<template>
  <div class="chatbox__text-box rounded-lg bg-white px-10 py-5 text-sm">
    <div class="flex space-x-3">
      <div class="size-6 shrink-0 rounded-full bg-slate-200"></div>
      <div class="flex flex-col">
        <div class="select-none font-semibold" style="padding-top: 1.5px">
          {{
            role == 'user'
              ? $t('user.placeholder')
              : $t('assistant.placeholder')
          }}
        </div>
        <div
          v-dompurify-html="message"
          class="w-full pr-10"
          ref="messageContentRef"
        ></div>
      </div>
    </div>
  </div>
</template>
