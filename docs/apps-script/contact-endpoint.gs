/**
 * Baba Flats — contact form lead capture (Google Apps Script Web App).
 *
 * Deployed as a Web App and wired to CONTACT_APPS_SCRIPT_URL, this receives the
 * JSON submission POSTed by app/api/contact, appends a timestamped row to the
 * bound Google Sheet, and emails the details to the leasing inbox.
 *
 * See README.md in this folder for setup and deployment steps.
 *
 * Expected POST body (from the Next contact route):
 *   {
 *     "form": { fullName, email, phone, bedroom, moveIn, tourType, message },
 *     "submittedAt": "ISO-8601 string",
 *     "page": "contact",
 *     "siteName": "Baba Flats"
 *   }
 */

var CONTACT_TO_EMAIL = "Contact@babaflats.com";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var form = (body && body.form) || {};
    var submittedAt = (body && body.submittedAt) || new Date().toISOString();

    // 1. Append a timestamped row to the active sheet.
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Write a labeled header row once, while the sheet is still empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Submitted At",
        "Full Name",
        "Email",
        "Phone",
        "Bedroom",
        "Move-In",
        "Tour Type",
        "Message",
      ]);
    }
    sheet.appendRow([
      submittedAt,
      form.fullName || "",
      form.email || "",
      form.phone || "",
      form.bedroom || "",
      form.moveIn || "",
      form.tourType || "",
      form.message || "",
    ]);

    // 2. Send email(s). Prefer the messages rendered by the website server
    //    (acknowledgement to the submitter + internal notification, each with
    //    its own cc / replyTo). Fall back to a single internal email for older
    //    callers that don't send an `emails` array.
    // NOTE: after pasting this file into the Apps Script editor you MUST create
    //    a new Web App deployment (or "Manage deployments" → edit → Deploy) for
    //    the change to take effect.
    var emails = (body && body.emails) || [];
    if (emails.length) {
      for (var i = 0; i < emails.length; i++) {
        var m = emails[i];
        if (!m || !m.to) continue;
        var opts = {
          name: "Baba Flats",
          to: m.to,
          subject: m.subject || "Baba Flats",
          body: m.body || "",
        };
        if (m.cc) opts.cc = m.cc;
        if (m.bcc) opts.bcc = m.bcc;
        if (m.replyTo) opts.replyTo = m.replyTo;
        MailApp.sendEmail(opts);
      }
    } else {
      var lines = [
        "New tour request from " + (body && body.siteName ? body.siteName : "Website"),
        "",
        "Submitted: " + submittedAt,
        "Full name: " + (form.fullName || ""),
        "Email: " + (form.email || ""),
        "Phone: " + (form.phone || ""),
        "Bedroom: " + (form.bedroom || ""),
        "Move-in: " + (form.moveIn || ""),
        "Tour type: " + (form.tourType || ""),
        "",
        "Message:",
        form.message || "(none)",
      ];

      MailApp.sendEmail({
        name: "Baba Flats",
        to: CONTACT_TO_EMAIL,
        replyTo: form.email || undefined,
        subject: "New Tour Request - " + (form.fullName || "Website lead"),
        body: lines.join("\n"),
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
