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

    const userPrompt =
      payload.action === EditorActionEnum.CUSTOM
        ? payload.prompt + ' ' + payload.selectedText
        : payload.selectedText;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
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
    const initSysPrompt =
      'This is a conversation between a user and an AI writing assistant. ';
    let sysPrompt = '';
    switch (action) {
      case EditorActionEnum.IMPROVE:
        sysPrompt =
          'You are an AI writing assistant that improves existing text. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.';
        break;
      case EditorActionEnum.EXTEND:
        sysPrompt =
          'You are an AI writing assistant that continues existing text based on context from prior text. ' +
          'Give more weight/priority to the later characters than the beginning ones. ' +
          'Limit your response to no more than 200 characters, but make sure to construct complete sentences.';
        break;
      case EditorActionEnum.SHORTEN:
        sysPrompt =
          'You are an AI writing assistant that shortens existing text. ';
        break;
      case EditorActionEnum.REPHRASE:
        sysPrompt = 'Rephrase the text.';
        break;
      case EditorActionEnum.SUMMARIZE:
        sysPrompt = 'Summarize the text.';
        break;
      case EditorActionEnum.SIMPLIFY:
        sysPrompt = 'Simplify the text.';
        break;
      case EditorActionEnum.SPELLING:
        sysPrompt = 'Correct the spelling.';
        break;
      case EditorActionEnum.CUSTOM:
        sysPrompt = 'You are an AI writing assistant who helps the user. ';
        break;
      default:
        sysPrompt = 'Improve the text.';
        break;
    }
    return initSysPrompt + sysPrompt;
  }
}
