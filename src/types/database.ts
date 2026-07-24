/* agent-notes: { ctx: "Supabase database schema TypeScript definitions for complete 12 core tables", deps: [], state: active, last: "sato@2026-07-24" } */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          role: 'buyer' | 'creator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: 'buyer' | 'creator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: 'buyer' | 'creator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      creator_shops: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          profile_image_url: string | null;
          banner_image_url: string | null;
          bank_account_number: string | null;
          bank_ifsc: string | null;
          bank_upi_id: string | null;
          bank_account_name: string | null;
          is_verified: boolean;
          direct_upload_enabled: boolean;
          followers_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          profile_image_url?: string | null;
          banner_image_url?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          bank_upi_id?: string | null;
          bank_account_name?: string | null;
          is_verified?: boolean;
          direct_upload_enabled?: boolean;
          followers_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          profile_image_url?: string | null;
          banner_image_url?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          bank_upi_id?: string | null;
          bank_account_name?: string | null;
          is_verified?: boolean;
          direct_upload_enabled?: boolean;
          followers_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          creator_shop_id: string | null;
          name: string;
          slug: string;
          subtitle: string | null;
          description: string | null;
          price: number;
          is_free: boolean;
          category_id: string | null;
          subcategory_id: string | null;
          thumbnail_path: string | null;
          preview_path: string | null;
          video_path: string | null;
          audio_preview_path: string | null;
          gallery_paths: Json;
          file_size_bytes: number;
          file_format: string | null;
          source_path: string;
          software: Json;
          plugins: Json;
          tags: Json;
          status: 'pending' | 'approved' | 'rejected';
          sales_count: number;
          rating_avg: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_shop_id?: string | null;
          name: string;
          slug: string;
          subtitle?: string | null;
          description?: string | null;
          price?: number;
          is_free?: boolean;
          category_id?: string | null;
          subcategory_id?: string | null;
          thumbnail_path?: string | null;
          preview_path?: string | null;
          video_path?: string | null;
          audio_preview_path?: string | null;
          gallery_paths?: Json;
          file_size_bytes?: number;
          file_format?: string | null;
          source_path: string;
          software?: Json;
          plugins?: Json;
          tags?: Json;
          status?: 'pending' | 'approved' | 'rejected';
          sales_count?: number;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_shop_id?: string | null;
          name?: string;
          slug?: string;
          subtitle?: string | null;
          description?: string | null;
          price?: number;
          is_free?: boolean;
          category_id?: string | null;
          subcategory_id?: string | null;
          thumbnail_path?: string | null;
          preview_path?: string | null;
          video_path?: string | null;
          audio_preview_path?: string | null;
          gallery_paths?: Json;
          file_size_bytes?: number;
          file_format?: string | null;
          source_path?: string;
          software?: Json;
          plugins?: Json;
          tags?: Json;
          status?: 'pending' | 'approved' | 'rejected';
          sales_count?: number;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          total: number;
          status: 'pending' | 'paid' | 'failed';
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          billing_name: string | null;
          billing_email: string | null;
          billing_mobile: string | null;
          download_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total: number;
          status?: 'pending' | 'paid' | 'failed';
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          billing_name?: string | null;
          billing_email?: string | null;
          billing_mobile?: string | null;
          download_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total?: number;
          status?: 'pending' | 'paid' | 'failed';
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          billing_name?: string | null;
          billing_email?: string | null;
          billing_mobile?: string | null;
          download_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          template_id: string | null;
          template_slug: string | null;
          creator_shop_id: string | null;
          name: string;
          price: number;
          platform_fee: number;
          creator_earnings: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          template_id?: string | null;
          template_slug?: string | null;
          creator_shop_id?: string | null;
          name: string;
          price: number;
          platform_fee?: number;
          creator_earnings?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          template_id?: string | null;
          template_slug?: string | null;
          creator_shop_id?: string | null;
          name?: string;
          price?: number;
          platform_fee?: number;
          creator_earnings?: number;
          created_at?: string;
        };
      };
      creator_payout_requests: {
        Row: {
          id: string;
          creator_shop_id: string;
          amount: number;
          status: 'pending' | 'processed' | 'rejected';
          bank_reference_number: string | null;
          admin_notes: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_shop_id: string;
          amount: number;
          status?: 'pending' | 'processed' | 'rejected';
          bank_reference_number?: string | null;
          admin_notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_shop_id?: string;
          amount?: number;
          status?: 'pending' | 'processed' | 'rejected';
          bank_reference_number?: string | null;
          admin_notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
      };
      creator_followers: {
        Row: {
          id: string;
          user_id: string;
          creator_shop_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          creator_shop_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          creator_shop_id?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          order_item_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          is_verified_buyer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          order_item_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_verified_buyer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          order_item_id?: string | null;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          is_verified_buyer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string;
          created_at?: string;
        };
      };
      download_logs: {
        Row: {
          id: string;
          user_id: string | null;
          order_id: string;
          template_id: string | null;
          download_token: string;
          ip_address: string | null;
          user_agent: string | null;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_id: string;
          template_id?: string | null;
          download_token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_id?: string;
          template_id?: string | null;
          download_token?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          downloaded_at?: string;
        };
      };
    };
  };
}
