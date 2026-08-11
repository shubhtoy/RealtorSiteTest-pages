/**
 * Substitutes {{field}} / {field} tokens in an email template with values from
 * the submitted form. Pure and framework-free so it is unit-testable; callers
 * that use the result in email headers must sanitize it themselves.
 */
export function renderTemplate(template: string, form: Record<string, string>): string {
  return template.replace(/\{\{?\s*(\w+)\s*\}?\}/g, (_match, key: string) => {
    const value = form[key];
    return typeof value === "string" ? value : "";
  });
}

// Editable defaults. These are used when the Studio-editable content does not
// provide an override. Placeholders: {{fullName}} {{email}} {{phone}}
// {{bedroom}} {{moveIn}} {{tourType}} {{message}}.
export const DEFAULT_ACK_SUBJECT = "Thanks for reaching out to Baba Flats, {{fullName}}";
export const DEFAULT_ACK_BODY = [
  "Hi {{fullName}},",
  "",
  "Thanks for your tour request at Baba Flats. We've received your details and our leasing team will reach out shortly to confirm availability and next steps.",
  "",
  "Your request:",
  "- Floor plan: {{bedroom}}",
  "- Move-in: {{moveIn}}",
  "- Tour type: {{tourType}}",
  "",
  "If anything changes, just reply to this email.",
  "",
  "— Baba Flats Leasing",
].join("\n");
export const DEFAULT_INTERNAL_SUBJECT = "New Tour Request - {{fullName}}";
export const DEFAULT_INTERNAL_BODY = [
  "New tour request:",
  "",
  "Name: {{fullName}}",
  "Email: {{email}}",
  "Phone: {{phone}}",
  "Floor plan: {{bedroom}}",
  "Move-in: {{moveIn}}",
  "Tour type: {{tourType}}",
  "",
  "Message:",
  "{{message}}",
].join("\n");
