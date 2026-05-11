import { google } from "googleapis";

export async function getSheetRows() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: process.env.GOOGLE_SHEETS_RANGE,
  });

  const rows = response.data.values || [];
  const headers = rows[0];

  return rows.slice(1).map((row, i) => ({
    ...Object.fromEntries(
      headers.map((header, index) => [header, row[index] || null])
    ),
    _rowIndex: String(i + 2), // row 1 = cabeçalho, dados começam na linha 2
  }));
}