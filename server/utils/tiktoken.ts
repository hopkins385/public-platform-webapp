// eslint-disable-next-line camelcase
import { encoding_for_model } from 'tiktoken';

export function getTokenCount(text: string | null | undefined) {
  if (!text) {
    return 0;
  }
  const encoding = encoding_for_model('gpt-3.5-turbo');
  const tokens = encoding.encode(text);
  return tokens.length;
}
