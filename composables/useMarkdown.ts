import type { Options } from 'markdown-it';
import type { Options as LinkifyOptions } from 'linkify-it';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import mk from '@vscode/markdown-it-katex';

export default function useMarkdown() {
  const mdOptions: Options = {
    html: false,
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
  };

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

  // Add a renderer rule to make links external
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    // Add target="_blank"
    const aIndex = token.attrIndex('target');
    if (aIndex < 0) {
      token.attrPush(['target', '_blank']);
    } else {
      token.attrs[aIndex][1] = '_blank';
    }

    // Add rel="noopener noreferrer"
    const relIndex = token.attrIndex('rel');
    if (relIndex < 0) {
      token.attrPush(['rel', 'noopener noreferrer']);
    } else {
      token.attrs[relIndex][1] = 'noopener noreferrer';
    }

    return self.renderToken(tokens, idx, options);
  };

  function parseMarkdown(text: string) {
    return md.render(text);
  }

  return {
    parseMarkdown,
  };
}
