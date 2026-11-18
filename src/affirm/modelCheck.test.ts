import { describe, expect, it } from 'vitest';
import { runModelChecks } from './modelCheck';

describe('lifecycle model', () => {
  it('matches the sequence and step specifications', () => {
    expect(() => runModelChecks()).not.toThrow();
  });
});
