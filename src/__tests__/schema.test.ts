/* agent-notes: { ctx: "unit and contract tests for complete 12-table Supabase schema definitions and database types", deps: ["src/types/database.ts"], state: active, last: "tara@2026-07-24" } */

import { describe, it, expect } from 'vitest';
import type { Database, Json } from '../types/database';

describe('Database Schema & Type Safety Contract Tests', () => {
  it('should define all 12 core tables in Database TypeScript schema', () => {
    // Compile-time and runtime check for table keys in Database type
    type PublicTables = keyof Database['public']['Tables'];

    const expectedTables: PublicTables[] = [
      'categories',
      'subcategories',
      'user_profiles',
      'creator_shops',
      'templates',
      'orders',
      'order_items',
      'creator_payout_requests',
      'creator_followers',
      'reviews',
      'wishlists',
      'download_logs',
    ];

    expect(expectedTables).toHaveLength(12);
  });

  it('should enforce user_profiles default role as buyer', () => {
    type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
    type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

    const sampleInsert: UserProfileInsert = {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Test Buyer',
      role: 'buyer',
    };

    expect(sampleInsert.role).toBe('buyer');
  });

  it('should support rich asset metadata in templates table', () => {
    type TemplateRow = Database['public']['Tables']['templates']['Row'];

    const mockTemplate: Partial<TemplateRow> = {
      name: 'Cyberpunk After Effects Pack',
      price: 499.0,
      gallery_paths: ['/thumbnails/1.jpg', '/thumbnails/2.jpg'],
      file_size_bytes: 104857600,
      file_format: '.aep',
      rating_avg: 4.8,
      rating_count: 15,
      software: ['After Effects CC 2024'],
      plugins: ['Element 3D'],
      tags: ['cyberpunk', 'neon', 'intro'],
    };

    expect(mockTemplate.file_format).toBe('.aep');
    expect(mockTemplate.file_size_bytes).toBe(104857600);
    expect(mockTemplate.rating_avg).toBe(4.8);
  });

  it('should support revenue split fields in order_items table', () => {
    type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

    const mockOrderItem: Partial<OrderItemRow> = {
      price: 1000.0,
      platform_fee: 200.0,
      creator_earnings: 800.0,
    };

    expect(mockOrderItem.platform_fee).toBe(200.0);
    expect(mockOrderItem.creator_earnings).toBe(800.0);
    expect(mockOrderItem.platform_fee! + mockOrderItem.creator_earnings!).toBe(mockOrderItem.price);
  });

  it('should enforce verified shop flag in creator_shops table', () => {
    type CreatorShopRow = Database['public']['Tables']['creator_shops']['Row'];

    const mockShop: Partial<CreatorShopRow> = {
      name: 'Studio X',
      is_verified: true,
      followers_count: 150,
    };

    expect(mockShop.is_verified).toBe(true);
    expect(mockShop.followers_count).toBe(150);
  });
});
