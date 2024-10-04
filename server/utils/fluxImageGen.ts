/*interface GenerationRequest {
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
}*/

export interface FluxProPlusInputs {
  prompt: string;
  width?: number; // default: 1024, min: 256, max: 1440, multiple of 32
  height?: number; // default: 768, min: 256, max: 1440, multiple of 32
  steps?: number; // default: 40, min: 1, max: 50
  prompt_upsampling?: boolean; // default: false
  seed?: number | null; // default: null
  guidance?: number; // min: 1.5, max: 5.0, default: 2.5
  safety_tolerance?: number | null; // min: 0, max: 6, default: 2
  interval?: number; // min: 1.0, max: 4.0, default: 2.0
}

interface ResultResponse {
  id: string;
  status: StatusResponse;
  result?: {
    sample: string;
  };
}

interface GenerationResponse {
  id: string;
}

interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

interface PollingResult {
  id: string;
  imgUrl: string | null;
  status: StatusResponse;
}

export enum StatusResponse {
  TaskNotFound = 'Task not found',
  Pending = 'Pending',
  RequestModerated = 'Request Moderated',
  ContentModerated = 'Content Moderated',
  Ready = 'Ready',
  Error = 'Error',
}

export class FluxImageGenerator {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.bfl.ml/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateImage(request: FluxProPlusInputs): Promise<PollingResult> {
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

  async #createRequest(request: FluxProPlusInputs): Promise<GenerationResponse> {
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
      if (response.status === 422) {
        const validationError: HTTPValidationError = await response.json();
        throw new Error(`Validation error: ${JSON.stringify(validationError)}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async #pollForResult(requestId: string): Promise<PollingResult> {
    const maxAttempts = 60; // Adjust as needed
    const pollingInterval = 500; // 500ms

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await this.#getResult(requestId);

      switch (res.status) {
        case StatusResponse.Ready:
          if (res.result) {
            return {
              id: requestId,
              imgUrl: res.result.sample,
              status: res.status,
            };
          } else {
            throw new Error('Result is missing');
          }
          break;
        case StatusResponse.Pending:
          break;
        case StatusResponse.Error:
        case StatusResponse.TaskNotFound:
        case StatusResponse.RequestModerated:
        case StatusResponse.ContentModerated:
          return {
            id: requestId,
            imgUrl: null,
            status: res.status,
          };
        default:
          throw new Error(`Unexpected response status: ${res.status}`);
      }

      await this.#sleep(pollingInterval);
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
      if (response.status === 422) {
        const validationError: HTTPValidationError = await response.json();
        throw new Error(`Validation error: ${JSON.stringify(validationError)}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  #sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
