// agent-notes: { ctx: "Aggregations for creator financials, payments holding, contact info, and template metrics", deps: [], state: active, last: "sato@2026-08-21" }

export interface CreatorFinancialSummary {
  totalSales: number;
  grossRevenue: number;
  lifetimeEarnings: number;
  paidOutAmount: number;
  holdingBalance: number;
  pendingPayoutAmount: number;
}

export interface CreatorTemplateSummary {
  totalTemplates: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export interface CreatorContactSummary {
  primaryEmail: string;
  phone: string;
  joinedCommunity: boolean;
  payoutMethod: string;
  joinedDate: string;
}

/**
 * Calculates financial earnings and currently held balance for a creator shop
 */
export function aggregateCreatorFinancials(
  shopId: string,
  orderItems: Array<{ creator_shop_id?: string | null; price?: number | null; creator_earnings?: number | null }> = [],
  payoutRequests: Array<{ creator_shop_id?: string | null; amount?: number | null; status?: string | null }> = []
): CreatorFinancialSummary {
  const shopOrderItems = (orderItems || []).filter((item) => item.creator_shop_id === shopId);
  const shopPayoutRequests = (payoutRequests || []).filter((p) => p.creator_shop_id === shopId);

  let grossRevenue = 0;
  let lifetimeEarnings = 0;

  for (const item of shopOrderItems) {
    const price = Number(item.price) || 0;
    grossRevenue += price;

    if (item.creator_earnings !== null && item.creator_earnings !== undefined && Number(item.creator_earnings) > 0) {
      lifetimeEarnings += Number(item.creator_earnings);
    } else {
      lifetimeEarnings += Math.round(price * 0.8 * 100) / 100;
    }
  }

  let paidOutAmount = 0;
  let pendingPayoutAmount = 0;

  for (const req of shopPayoutRequests) {
    const amt = Number(req.amount) || 0;
    const status = (req.status || 'pending').toLowerCase().trim();
    if (status === 'approved') {
      paidOutAmount += amt;
    } else if (status === 'pending') {
      pendingPayoutAmount += amt;
    }
  }

  const holdingBalance = Math.max(0, Math.round((lifetimeEarnings - paidOutAmount) * 100) / 100);

  return {
    totalSales: shopOrderItems.length,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    lifetimeEarnings: Math.round(lifetimeEarnings * 100) / 100,
    paidOutAmount: Math.round(paidOutAmount * 100) / 100,
    holdingBalance,
    pendingPayoutAmount: Math.round(pendingPayoutAmount * 100) / 100,
  };
}

/**
 * Summarizes templates uploaded by a specific creator shop
 */
export function summarizeCreatorTemplates(
  shopId: string,
  templates: Array<{ creator_shop_id?: string | null; status?: string | null }> = []
): CreatorTemplateSummary {
  const shopTemplates = (templates || []).filter((t) => t.creator_shop_id === shopId);

  let approvedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;

  for (const t of shopTemplates) {
    const status = (t.status || 'pending').toLowerCase().trim();
    if (status === 'approved') {
      approvedCount++;
    } else if (status === 'rejected') {
      rejectedCount++;
    } else {
      pendingCount++;
    }
  }

  return {
    totalTemplates: shopTemplates.length,
    approvedCount,
    pendingCount,
    rejectedCount,
  };
}

/**
 * Extracts and formats creator contact details, whatsapp community status, and payment method
 */
export function formatCreatorContactAndJoining(
  shop: {
    phone?: string | null;
    email?: string | null;
    joined_community?: boolean | null;
    created_at?: string | null;
    upi_id?: string | null;
    account_holder_name?: string | null;
    bank_account_number?: string | null;
    bank_ifsc?: string | null;
    [key: string]: any;
  },
  user?: { email?: string | null } | null
): CreatorContactSummary {
  const primaryEmail = (shop?.email || user?.email || 'N/A').trim();
  const phone = (shop?.phone || 'Not Provided').trim();
  const joinedCommunity = Boolean(shop?.joined_community);

  let payoutMethod = 'Not Configured';
  if (shop?.upi_id) {
    payoutMethod = `UPI: ${shop.upi_id}`;
  } else if (shop?.bank_account_number) {
    payoutMethod = `Bank: ${shop.bank_account_number} (${shop.bank_ifsc || 'IFSC N/A'})`;
  }

  let joinedDate = 'N/A';
  if (shop?.created_at) {
    joinedDate = new Date(shop.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return {
    primaryEmail,
    phone,
    joinedCommunity,
    payoutMethod,
    joinedDate,
  };
}
