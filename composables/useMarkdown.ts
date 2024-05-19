import type { Options as LinkifyOptions } from 'linkify-it';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export default function useMarkdown() {
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: false,
    typographer: true,

    highlight: function (str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            `<pre><code class="hljs language-${lang}">` +
            hljs.highlight(str, { language: lang, ignoreIllegals: true })
              .value +
            '</code></pre>'
          );
        } catch (__) {}
      }

      return (
        '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
      );
    },
  } as MarkdownIt.Options;

  const linkifyOptions: LinkifyOptions = {
    fuzzyLink: false,
    fuzzyIP: false,
    fuzzyEmail: false,
  };

  const disable = [
    'reference',
    'image',
    'link',
    'html_block',
    'html_inline',
    'autolink',
  ];

  const md = new MarkdownIt(mdOptions ?? {}).disable(disable);
  md.linkify.set(linkifyOptions ?? {});

  function parseMarkdown(text: string) {
    return md.render(text);
  }

  return {
    parseMarkdown,
  };
}
