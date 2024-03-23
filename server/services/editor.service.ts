import OpenAI from 'openai';

interface FetchCompletionPayload {
  lang: string;
  action: string;
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
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI writing assistant that continues existing text based on context from prior text. ' +
            'Give more weight/priority to the later characters than the beginning ones. ' +
            'Limit your response to no more than 200 characters, but make sure to construct complete sentences.',
        },
        {
          role: 'user',
          content: payload.prompt,
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
}
