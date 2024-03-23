import OpenAI from 'openai';
import { EditorActionEnum } from '../utils/enums/editorActionEnum';

interface FetchCompletionPayload {
  lang: string;
  action: string;
  selectedText: string;
  fullText: string;
  prompt: string;
}

export class EditorService {
  openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async fetchCompletion(payload: FetchCompletionPayload) {
    const systemPrompt = this.getSystemPrompt(
      payload.action as EditorActionEnum,
    );

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: payload.selectedText,
        },
      ],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
      n: 1,
    });

    const completion = response.choices[0].message.content;
    return completion;
  }

  getSystemPrompt(action: EditorActionEnum) {
    const initPrompt =
      'This is a conversation between a user and an AI writing assistant. ';
    let prompt = '';
    switch (action) {
      case EditorActionEnum.IMPROVE:
        prompt =
          'You are an AI writing assistant that improves existing text. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.';
        break;
      case EditorActionEnum.EXTEND:
        prompt =
          'You are an AI writing assistant that continues existing text based on context from prior text. ' +
          'Give more weight/priority to the later characters than the beginning ones. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.';
        break;
      case EditorActionEnum.SHORTEN:
        prompt =
          'You are an AI writing assistant that shortens existing text. ';
        break;
      case EditorActionEnum.REPHRASE:
        prompt = 'Rephrase the text.';
        break;
      case EditorActionEnum.SUMMARIZE:
        prompt = 'Summarize the text.';
        break;
      case EditorActionEnum.SIMPLIFY:
        prompt = 'Simplify the text.';
        break;
      case EditorActionEnum.SPELLING:
        prompt = 'Correct the spelling.';
        break;
      default:
        prompt = 'Improve the text.';
        break;
    }
    return initPrompt + prompt;
  }
}
