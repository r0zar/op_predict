import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Make vi available globally
globalThis.vi = vi;

// extend vitest's expect method with jest-dom matchers
expect.extend({});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});