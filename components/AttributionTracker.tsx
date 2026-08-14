// agent-notes: { ctx: "Client component for automatic touchpoint capture, product view recording, and user attribution sync", deps: ["lib/attribution.ts", "lib/supabaseClient.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  captureAttribution,
  recordProductView,
  getStoredAttribution,
  StoredAttribution,
} from "../lib/attribution";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

export default function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const lastCapturedPathRef = useRef<string | null>(null);

  // Sync client attribution with server database for authenticated users
  const syncWithServer = async (attr: StoredAttribution, token: string) => {
    try {
      await fetch("/api/attribution/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attribution: attr }),
      });
    } catch (e) {
      console.error("Failed to sync attribution to server:", e);
    }
  };

  // 1. Capture touchpoints on route/parameter change
  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastCapturedPathRef.current === fullPath) return;
    lastCapturedPathRef.current = fullPath;

    // Capture standard touchpoint (UTM, referrer, landing page)
    let attr = captureAttribution();

    // Check if on product detail page: /product/[slug]
    if (pathname && pathname.startsWith("/product/")) {
      const parts = pathname.split("/product/")[1];
      const productSlug = parts ? parts.split("/")[0] : null;
      if (productSlug) {
        attr = recordProductView(productSlug);
      }
    }

    // If user is already signed in, sync attribution
    const checkAndSync = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session && attr) {
          await syncWithServer(attr, session.access_token);
        }
      } catch {}
    };

    checkAndSync();
  }, [pathname, searchParams]);

  // 2. Listen to Supabase Auth State Changes (Login, Sign-Up)
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && session.user.id !== lastSyncedUserIdRef.current) {
          lastSyncedUserIdRef.current = session.user.id;
          const attr = getStoredAttribution();
          if (attr) {
            await syncWithServer(attr, session.access_token);
          }
        } else if (!session) {
          lastSyncedUserIdRef.current = null;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return null;
}
