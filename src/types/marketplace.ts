/* agent-notes: { ctx: "Marketplace domain model interfaces and API payload types", deps: [src/types/database.ts], state: active, last: "tara@2026-07-23" } */

import { Database } from './database';

export type Category = Database['public']['Tables']['categories']['Row'];
export type Subcategory = Database['public']['Tables']['subcategories']['Row'];
export type CreatorShop = Database['public']['Tables']['creator_shops']['Row'];
export type MarketplaceProduct = Database['public']['Tables']['templates']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type PayoutRequest = Database['public']['Tables']['creator_payout_requests']['Row'];

export interface CreateOrderPayload {
  productSlug: string;
  billingName: string;
  billingEmail: string;
  billingMobile: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
  productName: string;
}

export interface PresignedDownloadResponse {
  downloadUrl: string;
  expiresInSeconds: number;
}

export interface PayoutCalculation {
  grossAmount: number;
  platformSplitPercentage: number; // e.g., 20
  creatorSplitPercentage: number;  // e.g., 80
  platformFee: number;
  creatorEarnings: number;
}
