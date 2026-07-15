# Contact Lead Capture — Google Apps Script

This Apps Script Web App is the zero-infrastructure lead delivery channel for the
Baba Flats contact form. It receives each submission from the Next.js contact
route (`app/api/contact`), appends a row to a Google Sheet, and emails the
details to the leasing inbox (`Contact@babaflats.com`).

The Next route always persists leads locally first, so this channel is optional
and additive — the site works with or without it configured.

## What the script does

`doPost(e)` in [`contact-endpoint.gs`](./contact-endpoint.gs):

1. Parses the JSON body (`JSON.parse(e.postData.contents)`).
2. Appends a timestamped row to the active sheet:
   `[submittedAt, fullName, email, phone, bedroom, moveIn, tourType, message]`.
3. Sends an email to `Contact@babaflats.com` with the lead details
   (`replyTo` set to the submitter so you can reply directly).
4. Returns `ContentService` JSON `{ ok: true }`.

## Setup

1. **Create the Sheet.** On the team **shared drive**, create a new Google Sheet
   (e.g. "Baba Flats — Contact Leads"). Optionally add a header row:
   `Submitted At | Full Name | Email | Phone | Bedroom | Move-In | Tour Type | Message`.
2. **Open the script editor.** In the Sheet, go to **Extensions → Apps Script**.
   This creates a script bound to the Sheet, so `getActiveSpreadsheet()` resolves
   to it automatically.
3. **Paste the code.** Replace the default `Code.gs` contents with everything in
   [`contact-endpoint.gs`](./contact-endpoint.gs), then **Save**.
4. **Deploy as a Web App.** Click **Deploy → New deployment → Web app** and set:
   - **Execute as:** _Me_ (so the script can write to the Sheet and send mail).
   - **Who has access:** _Anyone with the link_ (the Next server calls it
     server-to-server without Google auth).
5. **Authorize** the requested Sheet + Gmail/MailApp scopes on first deploy.
6. **Copy the Web App URL** (ends in `/exec`) and set it in your environment:

   ```bash
   CONTACT_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```

Restart the Next server so it picks up the new env value. Submit a test lead and
confirm a new row appears in the Sheet and an email arrives at
`Contact@babaflats.com`.

## Updating the script

After editing `contact-endpoint.gs`, create a **new deployment version** (or
**Manage deployments → edit → new version**). The `/exec` URL stays the same, so
`CONTACT_APPS_SCRIPT_URL` does not need to change.

## Notes

- Keep the `/exec` URL out of source control — it is an unauthenticated endpoint.
  Treat it as a secret and store it only in the deployment environment.
- The Next route treats a non-2xx response from this endpoint as a delivery
  failure and returns HTTP 207 (the lead is still saved locally).
