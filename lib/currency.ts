// Currency utility functions
// Supports both INR (₹) and USD ($) formatting

export type Currency = 'INR' | 'USD';

// Standard Exchange Rate (1 USD = 85 INR)
export const INR_TO_USD_RATE = 85;

export function getCurrencySymbol(currency: Currency = 'INR'): string {
  return currency === 'USD' ? '$' : '₹';
}

export function convertInrToUsd(inrAmount: number): number {
  return Number((inrAmount / INR_TO_USD_RATE).toFixed(2));
}

export function convertUsdToInr(usdAmount: number): number {
  return Math.round(usdAmount * INR_TO_USD_RATE);
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
