import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getBatchTemplateDownloads } from "@/lib/downloadStats";
import CreatorFollowButton from "@/components/CreatorFollowButton";
import CreatorShopClient from "./CreatorShopClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ shopSlug: string }>;
}

type CreatorTemplate = {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  img: string | null;
  video: string | null;
  video_path?: string | null;
  thumbnail_path?: string | null;
  audio_preview_path?: string | null;
  model_3d_path?: string | null;
  category_id: string | null;
  created_at: string | null;
};

type Category = {
  id: string;
  name: string;
  slug?: string | null;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const supabase = getSupabaseServerClient();

  const { data: shop } = await supabase
    .from("creator_shops")
    .select("name, description")
    .ilike("slug", params.shopSlug)
    .maybeSingle();

  if (!shop) {
    return {
      title: "Creator not found | Celite",
    };
  }

  const title = `${shop.name} | Celite Creator`;
  const description =
    shop.description ||
    "Discover templates and assets from this Celite creator.";

  return {
    title,
    description,
  };
}

export default async function CreatorShopPage(props: PageProps) {
  const params = await props.params;
  const supabase = getSupabaseServerClient();

  // Try fetching with branding fields using case-insensitive ilike match
  let { data: shop, error: shopErr } = await supabase
    .from("creator_shops")
    .select("id, user_id, name, description, slug, banner_url, logo_url, profile_image_url, tagline, location, website_url, instagram_url, youtube_url, twitter_url, created_at")
    .ilike("slug", params.shopSlug)
    .maybeSingle();

  // Fallback to base fields if new branding columns don't exist in Supabase DB yet
  if (shopErr || !shop) {
    const { data: baseShop } = await supabase
      .from("creator_shops")
      .select("id, user_id, name, description, slug, created_at")
      .ilike("slug", params.shopSlug)
      .maybeSingle();

    if (baseShop) {
      shop = baseShop as any;
    }
  }

  if (!shop) return notFound();

  const { data: templates } = await supabase
    .from("templates")
    .select(
      "slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,model_3d_path,category_id,created_at,status"
    )
    .eq("creator_shop_id", shop.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const creatorTemplates: CreatorTemplate[] = (templates || []) as any;

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name");

  const categoryMap = new Map<string, Category>();
  (categories || []).forEach((c: any) => {
    categoryMap.set(c.id, { id: c.id, name: c.name, slug: c.slug });
  });

  // Fetch real download counts on the server side using bypass-RLS admin client
  const admin = getSupabaseAdminClient();
  const slugs = creatorTemplates.map(t => t.slug);
  let counts: Record<string, number> = {};
  if (slugs.length > 0) {
    try {
      counts = await getBatchTemplateDownloads(admin, slugs);
    } catch (err) {
      console.error('Error fetching batch download counts on shop page:', err);
    }
  }

  const grouped = new Map<string, { category: Category | null; items: (CreatorTemplate & { downloadCount: number })[] }>();

  for (const t of creatorTemplates) {
    const cat =
      t.category_id && categoryMap.has(t.category_id)
        ? categoryMap.get(t.category_id)!
        : null;
    const key = cat ? cat.id : "__uncategorized__";
    if (!grouped.has(key)) {
      grouped.set(key, {
        category: cat,
        items: [],
      });
    }
    grouped.get(key)!.items.push({
      ...t,
      downloadCount: counts[t.slug] || 0
    });
  }

  const groupedSections = Array.from(grouped.values());

  const { count: followerCount } = await supabase
    .from("creator_followers")
    .select("id", { count: "exact", head: true })
    .eq("creator_shop_id", shop.id);

  const followers = followerCount ?? 0;

  return (
    <CreatorShopClient
      shop={shop}
      groupedSections={groupedSections}
      initialFollowers={followers}
      totalProducts={creatorTemplates.length}
    />
  );
}

