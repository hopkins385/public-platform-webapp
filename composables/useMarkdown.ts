import type { Options } from 'markdown-it';
import type { Options as LinkifyOptions } from 'linkify-it';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import mk from '@vscode/markdown-it-katex';

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
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>'
          );
        } catch (__) {
          // silently ignore
        }
      }

      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    },
  } as Options;

  const linkifyOptions: LinkifyOptions = {
    fuzzyLink: false,
    fuzzyIP: false,
    fuzzyEmail: false,
  };

  // TODO: support right now only $ delimiters, need to add [ delimiters
  const katexOptions = {
    throwOnError: false,
    // errorColor: '#cc0000',
    enableBareBlocks: true,
    enableMathBlockInHtml: true,
    enableMathInlineInHtml: true,
    enableFencedBlocks: true,
  };

  const disable = ['reference', 'image', 'html_block', 'html_inline', 'autolink']; // 'link',

  const md = new MarkdownIt(mdOptions).disable(disable);
  md.linkify.set(linkifyOptions);
  md.use(mk, katexOptions);

  function parseMarkdown(text: string) {
    return md.render(text);
  }

  return {
    parseMarkdown,
  };
}
