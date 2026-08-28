// Sonnet - Test A/B Session 1

/**
 * Formatea un monto en centavos como precio en soles peruanos.
 * Ejemplo: formatPrice(129990) => "S/ 1,299.90"
 */
export function formatPrice(cents: number): string {
  const roundedCents = Math.round(cents);
  const isNegative = roundedCents < 0;
  const absoluteAmount = Math.abs(roundedCents) / 100;

  const formattedAmount = absoluteAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}S/ ${formattedAmount}`;
}
