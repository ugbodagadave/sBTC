/// <reference types="jest" />

import { stacksWorker } from '../src/workers/stacksWorker';

describe('Stacks Worker', () => {
  it('should be able to initialize the Stacks worker', () => {
    expect(stacksWorker).toBeDefined();
  });

  it('should be able to start and stop the worker', async () => {
    // Start the worker
    await stacksWorker.start();
    const status = await stacksWorker.getStatus();
    expect(status.running).toBe(true);

    // Stop the worker
    await stacksWorker.stop();
    const statusAfterStop = await stacksWorker.getStatus();
    expect(statusAfterStop.running).toBe(false);
  });
});