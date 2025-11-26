export const environment = {
  production: true,
  googleSheets: {
    enabled: true, // Set to true to enable automatic Google Sheets sync
    spreadsheetId: "1ZjfZK9UHWCmVKT31KCWAd4cLk0I_TrB_f_RPxo3sEL0", // Your Google Sheets spreadsheet ID
    appsScriptUrl:
      "https://script.google.com/macros/s/AKfycbycVeTWgCxtopatiGl7Bkr2sMRyjSTq6496qdF0GvLDjLh6naTUGZD3Mk8EKQX_Vd1c/exec",
  },
  googleDrive: {
    enabled: true, // Set to true to enable Google Drive image storage
    folderId: "1nXIOsYrbi0NL8GlrZQLWhHAtJL7U_83R", // Your Google Drive folder ID (get from folder URL)
  },
};
