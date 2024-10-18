export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  pollInterval: number = 500,
  timeoutAfter?: number,
): Promise<boolean> {
  // Track the start time for timeout purposes
  const startTime = Date.now();

  while (true) {
    // Check for timeout, bail if too much time passed
    if (typeof timeoutAfter === 'number' && Date.now() > startTime + timeoutAfter) {
      throw new Error('Condition not met before timeout');
    }

    // Check for condition immediately
    const result = await condition();

    if (result) {
      return result;
    }

    // Otherwise wait and check after pollInterval
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}
