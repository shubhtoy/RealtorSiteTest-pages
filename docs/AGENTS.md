# AGENTS.md — `docs/`

Operator and integration documentation.

## Contents

- `apps-script/contact-endpoint.gs` — the Google Apps Script Web App that receives contact
  submissions, appends a row to the leads Google Sheet, and sends the emails rendered by the site
  (acknowledgement to the submitter + internal notification, with cc / reply-to).

## Rules

- `contact-endpoint.gs` runs in the owner's Google account, **not** in this deploy. After editing it
  here, the owner must paste it into the Apps Script editor and **redeploy the Web App** (Manage
  deployments → Edit → Deploy). The `/exec` URL is stored server-side as `CONTACT_APPS_SCRIPT_URL`.
- Keep the `.gs` **backward compatible**: it must still work if the POST body omits the `emails`
  array (fall back to a single internal email).
- Document operator steps in plain language; assume the reader is non-technical leasing staff.
