// agent-notes: { ctx: "Validation helpers and constants for creator phone, email, and community links", deps: [], state: active, last: "sato@2026-08-21" }

export const CREATOR_COMMUNITY_WHATSAPP_URL = "https://chat.whatsapp.com/Hr5lE9ATo4XHR0PwHVpdxn";

export interface ContactValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates creator phone number and email
 */
export function validateCreatorContact(phone?: string | null, email?: string | null): ContactValidationResult {
  const cleanPhone = (phone || "").trim();
  const cleanEmail = (email || "").trim();

  if (!cleanPhone) {
    return { isValid: false, error: "Phone number is required." };
  }

  // Strip non-digits to ensure at least 10 digits (e.g. +91 9876543210 -> 919876543210)
  const digitsOnly = cleanPhone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return { isValid: false, error: "Please enter a valid phone number (at least 10 digits)." };
  }

  if (!cleanEmail) {
    return { isValid: false, error: "Email address is required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

/**
 * Checks if a creator shop is missing phone or email contact info
 */
export function isCreatorContactMissing(shop?: { phone?: string | null; email?: string | null } | null): boolean {
  if (!shop) return true;
  const phone = (shop.phone || "").trim();
  const email = (shop.email || "").trim();
  return !phone || !email;
}
