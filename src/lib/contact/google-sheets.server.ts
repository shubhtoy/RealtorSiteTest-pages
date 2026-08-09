import "server-only";

import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import { isGoogleSheetsConfigured, serverEnv } from "@/lib/server-env";

/**
 * Appends contact-form leads to a Google Sheet using the standard
 * `google-spreadsheet` client authenticated with a service account.
 *
 * Configuration is env-only (service-account credentials are secrets):
 * GOOGLE_SHEETS_ID, GOOGLE_SHEETS_TAB, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_PRIVATE_KEY. The service account must be shared as an Editor on the
 * target spreadsheet.
 */

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/** Column headers written to a freshly created/empty worksheet. */
const HEADERS = [
  "submittedAt",
  "fullName",
  "email",
  "phone",
  "bedroom",
  "moveIn",
  "tourType",
  "message",
  "page",
  "siteName",
];

type Submission = {
  form: {
    fullName: string;
    email: string;
    phone: string;
    bedroom: string;
    moveIn: string;
    tourType: string;
    message: string;
  };
  submittedAt: string;
  page: string;
  siteName: string;
};

function serviceAccountAuth(): JWT {
  return new JWT({
    email: serverEnv.googleServiceAccountEmail,
    key: serverEnv.googlePrivateKey,
    scopes: SCOPES,
  });
}

/**
 * Append one submission as a row. Ensures the target worksheet exists and has a
 * header row (created on first use).
 *
 * @throws when Sheets is not configured or the API call fails.
 */
export async function appendSubmissionToSheet(submission: Submission): Promise<void> {
  if (!isGoogleSheetsConfigured()) {
    throw new Error("Google Sheets is not configured");
  }

  const doc = new GoogleSpreadsheet(serverEnv.googleSheetsId, serviceAccountAuth());
  await doc.loadInfo();

  const tab = serverEnv.googleSheetsTab;
  let sheet = doc.sheetsByTitle[tab];
  if (!sheet) {
    sheet = await doc.addSheet({ title: tab, headerValues: HEADERS });
  } else {
    // loadHeaderRow throws when the first row is empty — seed headers if so.
    try {
      await sheet.loadHeaderRow();
    } catch {
      await sheet.setHeaderRow(HEADERS);
    }
  }

  const { form } = submission;
  await sheet.addRow({
    submittedAt: submission.submittedAt,
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    bedroom: form.bedroom,
    moveIn: form.moveIn,
    tourType: form.tourType,
    message: form.message,
    page: submission.page,
    siteName: submission.siteName,
  });
}
