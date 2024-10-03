interface GenerationRequest {
  prompt: string;
  width?: number; // default: 1024
  height?: number; // default: 768
  // Number of steps for the image generation process.
  steps?: number; // min: 1 max: 50, default: 40
  // Whether to perform upsampling on the prompt. If active, automatically modifies the prompt for more creative generation.
  promptUpsampling?: boolean; // default: false
  // Optional seed for reproducibility.
  seed?: number; // default: null
  // Guidance scale for image generation. High guidance scales improve prompt adherence at the cost of reduced realism.
  guidance?: number; // min: 1.5, max: 5.0, default: 2.5
  // Tolerance level for input and output moderation. Between 0 and 6, 0 being most strict, 6 being least strict.
  safetyTolerance?: number; // min: 0, max: 6, default: 2
  // Interval parameter for guidance control.
  interval?: number; // min: 1, max: 4, default: 2
}

interface GenerationResponse {
  id: string;
}

interface ResultResponse {
  status: string;
  result?: {
    sample: string;
  };
}

interface PollingResult {
  id: string;
  sample: string;
}

export class FluxImageGenerator {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.bfl.ml/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateImage(request: GenerationRequest): Promise<PollingResult> {
    try {
      // Step 1: Create the generation request
      const generationResponse = await this.#createRequest(request);

      // Step 2: Poll for the result
      const result = await this.#pollForResult(generationResponse.id);

      return result;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async #createRequest(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await fetch(`${this.baseUrl}/flux-pro-1.1`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async #pollForResult(requestId: string): Promise<PollingResult> {
    const maxAttempts = 60; // Adjust as needed
    const pollingInterval = 500; // 500ms

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await this.#getResult(requestId);

      if (res.status === 'Ready' && res.result) {
        return {
          id: requestId,
          sample: res.result.sample,
        };
      }

      await this.#delay(pollingInterval);
    }

    throw new Error('Timeout: Image generation took too long');
  }

  async #getResult(requestId: string): Promise<ResultResponse> {
    const url = new URL(`${this.baseUrl}/get_result`);
    url.searchParams.append('id', requestId);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  #delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
