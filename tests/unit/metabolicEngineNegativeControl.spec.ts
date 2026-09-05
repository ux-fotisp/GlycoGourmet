import { describe, it, expect } from 'vitest';

describe('Negative Control - TO-2 Gate Assertion', () => {
  it('intentionally violates TO-2 to validate CI gate failure and PR commenting', () => {
    expect(1.002).toBeCloseTo(1.0);
  });
});
