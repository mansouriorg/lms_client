// Prices are shown in Tunisian dinars (TND). One dinar is 1000 millimes, so
// amounts with a fractional part get three decimals: 212.5 -> "212.500 TND".
// Every page shows prices through formatPrice, so real prices from the API
// will be formatted the same way.
export const CURRENCY = 'TND';

export function formatPrice(amount: number): string {
  // To the nearest millime first (like the API's common/money.ts): a sum
  // like 0.2 + 0.7 + 0.1 is 0.9999999999999999 in JavaScript, shown 1 TND
  const value = Math.round(Number((amount * 1000).toFixed(6))) / 1000;
  const decimals = Number.isInteger(value) ? 0 : 3;
  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${number} ${CURRENCY}`;
}
