export default function useMarkdown() {
  const { $renderToMarkdown } = useNuxtApp();

  function render(text: string) {
    return $renderToMarkdown(text);
  }

  return {
    render,
  };
}
