/**
 * Renders an email subject template by substituting {{field}} / {field} tokens
 * with values from the submitted form. Returns a default subject when the
 * template is empty. Pure and framework-free so it is unit-testable; the caller
 * is responsible for header-sanitizing the result.
 */
export function renderSubject(template: string, form: Record<string, string>): string {
  const trimmed = template.trim();
  if (!trimmed) return `New Tour Request - ${form.fullName ?? ""}`.trim();
  return trimmed.replace(/\{\{?\s*(\w+)\s*\}?\}/g, (_match, key: string) => {
    const value = form[key];
    return typeof value === "string" ? value : "";
  });
}
