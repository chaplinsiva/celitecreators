/* agent-notes: { ctx: "Currency utility functions with PPP rate conversion", deps: [], state: active, last: "antigravity@2026-08-13" } */
// Currency utility functions
// Supports both INR (₹) and USD ($) formatting

export type Currency = 'INR' | 'USD';

// PPP Exchange Rate multiplier (USD = INR * 0.033)
export const USD_PPP_MULTIPLIER = 0.033;
export const INR_TO_USD_RATE = 1 / USD_PPP_MULTIPLIER; // kept for backwards compatibility (approx 30.3)

export function getCurrencySymbol(currency: Currency = 'INR'): string {
  return currency === 'USD' ? '$' : '₹';
}

export function convertInrToUsd(inrAmount: number): number {
  return Number((inrAmount * USD_PPP_MULTIPLIER).toFixed(2));
}

export function convertUsdToInr(usdAmount: number): number {
  return Math.round(usdAmount / USD_PPP_MULTIPLIER);
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === 'INR' && to === 'USD') return convertInrToUsd(amount);
  if (from === 'USD' && to === 'INR') return convertUsdToInr(amount);
  return amount;
}

export function formatPrice(amount: number, currency: Currency = 'INR'): string {
  const symbol = getCurrencySymbol(currency);
  if (currency === 'USD') {
    return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatPriceWithDecimal(amount: number, currency: Currency = 'INR'): string {
  const symbol = getCurrencySymbol(currency);
  if (currency === 'USD') {
    return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}
