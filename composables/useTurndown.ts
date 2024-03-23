import TurndownService from 'turndown';

export default function useTurndown() {
  const turndownService = new TurndownService();

  function toMarkdown(html: string) {
    return turndownService.turndown(html);
  }

  return {
    toMarkdown,
  };
}
