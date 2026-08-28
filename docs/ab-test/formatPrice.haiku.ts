// Haiku - Test A/B Session 1

function formatPrice(cents: number): string {
  const isNegative = cents < 0;
  const absoluteCents = Math.abs(cents);

  const soles = absoluteCents / 100;
  const formatted = soles.toFixed(2);

  const [integerPart, decimalPart] = formatted.split('.');

  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const result = `${withSeparators}.${decimalPart}`;

  return isNegative ? `-S/ ${result}` : `S/ ${result}`;
}

export default formatPrice;
