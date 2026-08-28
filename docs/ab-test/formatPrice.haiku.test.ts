// Haiku - Tests

import formatPrice from './formatPrice.haiku';

describe('formatPrice (Haiku)', () => {
  test('should format zero', () => {
    expect(formatPrice(0)).toBe('S/ 0.00');
  });

  test('should format positive price with thousands separator', () => {
    expect(formatPrice(129990)).toBe('S/ 1,299.90');
  });

  test('should format negative price', () => {
    expect(formatPrice(-500)).toBe('-S/ 5.00');
  });

  test('should round single cent', () => {
    expect(formatPrice(1)).toBe('S/ 0.01');
  });

  test('should format large price with multiple thousand separators', () => {
    expect(formatPrice(1000000)).toBe('S/ 10,000.00');
  });

  test('should format negative large price', () => {
    expect(formatPrice(-1000000)).toBe('-S/ 10,000.00');
  });

  test('should format price with no thousands', () => {
    expect(formatPrice(50)).toBe('S/ 0.50');
  });

  test('should format price around 100', () => {
    expect(formatPrice(10050)).toBe('S/ 100.50');
  });
});
