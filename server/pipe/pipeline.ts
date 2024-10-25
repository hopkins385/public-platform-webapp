type StepFunction = (input: any) => Promise<any>;
type FinallyFunction = (input: any) => void;

export class Pipe {
  private steps: StepFunction[] = [];
  private retryLimit: number;
  private finallyCallback?: FinallyFunction;

  constructor(retryLimit: number = 3) {
    this.retryLimit = retryLimit;
  }

  static create(retryLimit: number, callback: (workflow: Pipe) => void): Pipe {
    const workflow = new Pipe(retryLimit);
    callback(workflow);
    return workflow;
  }

  public addStep(stepFunction: StepFunction): this {
    this.steps.push(stepFunction);
    return this;
  }

  finally(callback: FinallyFunction) {
    this.finallyCallback = callback;
  }

  async run(initialInput?: any): Promise<void> {
    let input = initialInput;
    for (const fn of this.steps) {
      input = await retryWithExponentialBackoff(async () => fn(input), {
        retries: this.retryLimit,
        delay: 1000,
        factor: 3,
      });
    }

    if (this.finallyCallback) {
      try {
        this.finallyCallback(input);
      } catch (error) {
        console.error('Error in finally callback', error);
      }
    }
  }
}
