export enum ModelEnum {
  GroqLlama270B = 'llama2-70b-4096',
  GroqLlama38B = 'llama3-8b-8192',
  GroqLlama370B = 'llama3-70b-8192',
  GroqMixtral32K = 'mixtral-8x7b-32768',
  GroqGemma7b = 'gemma-7b-it',
  Mistral7B = 'open-mistral-7b',
  Mixtral7B = 'open-mixtral-8x7b',
  MistralSmall = 'mistral-small-latest',
  MistralMedium = 'mistral-medium-latest',
  MistralLarge = 'mistral-large-latest',
  ChatGPT4 = 'gpt-4',
  ChatGPT3 = 'gpt-3.5-turbo',
  Claude3Haiku = 'claude-3-haiku-20240307',
  Claude3Opus = 'claude-3-opus-20240229',
  Claude3Sonnet = 'claude-3-sonnet-20240229',
  Luminous = 'luminous',
  Local = 'local',
}

export enum ContextSize {
  '4K' = 4096,
  '8K' = 8192,
  '16K' = 16385,
  '64K' = 65536,
  '100K' = 100000,
  '128K' = 128000,
  '200K' = 200000,
}

export enum MaxTokens {
  '4K' = 4096,
}
