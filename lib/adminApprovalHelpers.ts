// agent-notes: { ctx: "Helper functions for admin template approval, approved/rejected listing, and rejection transitions", deps: [], state: active, last: "sato@2026-08-21" }

export type TemplateApprovalStatus = 'pending' | 'approved' | 'rejected' | 'all';

export interface AdminTemplateItem {
  slug: string;
  name: string;
  status?: string | null;
  creator_shop_id?: string | null;
  vendor_name?: string | null;
  [key: string]: any;
}

/**
 * Filters marketplace templates by review status (pending, approved, rejected, or all)
 */
export function filterTemplatesByMarketplaceStatus<T extends AdminTemplateItem>(
  templates: T[] = [],
  statusFilter: TemplateApprovalStatus = 'pending'
): T[] {
  if (!templates || !Array.isArray(templates)) return [];

  // Consider items that belong to a creator shop or have vendor attribution
  const vendorTemplates = templates.filter(
    (t) => Boolean(t.creator_shop_id || t.vendor_name)
  );

  if (statusFilter === 'all') {
    return vendorTemplates;
  }

  return vendorTemplates.filter((t) => {
    const s = (t.status || 'pending').toLowerCase().trim();
    return s === statusFilter;
  });
}

/**
 * Validates whether a template can transition from current status to target status
 */
export function canTransitionStatus(
  currentStatus?: string | null,
  targetStatus?: string | null
): boolean {
  if (!targetStatus) return false;
  const current = (currentStatus || 'pending').toLowerCase().trim();
  const target = targetStatus.toLowerCase().trim();

  if (current === target) return false;

  const validStatuses = ['pending', 'approved', 'rejected'];
  return validStatuses.includes(current) && validStatuses.includes(target);
}

/**
 * Returns available action status buttons for a given template status
 */
export function getAvailableActions(currentStatus?: string | null): Array<'approved' | 'rejected' | 'pending'> {
  const current = (currentStatus || 'pending').toLowerCase().trim();

  if (current === 'approved') {
    return ['rejected'];
  }
  if (current === 'rejected') {
    return ['approved'];
  }
  return ['approved', 'rejected'];
}
