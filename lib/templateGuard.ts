// agent-notes: { ctx: "Approval and status guard utilities for public templates and product pages", deps: [], state: active, last: "sato@2026-08-21" }

export interface TemplateStatusHolder {
  status?: string | null;
  [key: string]: any;
}

/**
 * Checks if a template has an active approved status
 */
export function isTemplateApproved(template?: TemplateStatusHolder | null): boolean {
  if (!template) return false;
  return (template.status || "").toLowerCase().trim() === "approved";
}

/**
 * Checks whether a template is eligible to render on public product details page
 */
export function shouldRenderPublicProductPage(template?: TemplateStatusHolder | null): boolean {
  return isTemplateApproved(template);
}

/**
 * Filters a list of templates to only approved items
 */
export function filterApprovedTemplates<T extends TemplateStatusHolder>(templates?: T[] | null): T[] {
  if (!templates || !Array.isArray(templates)) return [];
  return templates.filter((t) => isTemplateApproved(t));
}
