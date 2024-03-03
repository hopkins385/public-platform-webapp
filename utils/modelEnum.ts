export enum ModelEnum {
  GroqLlama4K = 'llama2-70b-4096',
  GroqMixtral32K = 'mixtral-8x7b-32768',
  Mistral7B = 'open-mistral-7b',
  Mixtral7B = 'open-mixtral-8x7b',
  MistralSmall = 'mistral-small-latest',
  MistralMedium = 'mistral-medium-latest',
  MistralLarge = 'mistral-large-latest',
  ChatGPT4 = 'gpt-4',
  ChatGPT3 = 'gpt-3.5-turbo',
  Claude = 'claude',
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
