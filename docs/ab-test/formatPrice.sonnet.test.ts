// Sonnet - Tests

import { formatPrice } from './formatPrice.sonnet';

describe('formatPrice (Sonnet)', () => {
  test('formatea cero correctamente', () => {
    expect(formatPrice(0)).toBe('S/ 0.00');
  });

  test('formatea un monto positivo con separador de miles', () => {
    expect(formatPrice(129990)).toBe('S/ 1,299.90');
  });

  test('formatea un monto negativo', () => {
    expect(formatPrice(-500)).toBe('-S/ 5.00');
  });

  test('formatea un centavo (redondeo a dos decimales)', () => {
    expect(formatPrice(1)).toBe('S/ 0.01');
  });

  test('formatea un millón de centavos con separadores de miles', () => {
    expect(formatPrice(1000000)).toBe('S/ 10,000.00');
  });

  test('formatea montos negativos grandes con separadores de miles', () => {
    expect(formatPrice(-129990)).toBe('-S/ 1,299.90');
  });

  test('redondea centavos no enteros hacia el entero más cercano', () => {
    expect(formatPrice(129990.6)).toBe('S/ 1,299.91');
  });
});
