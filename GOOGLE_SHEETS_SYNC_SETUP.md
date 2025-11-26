# Google Sheets Auto-Sync Setup

This guide will help you set up automatic syncing to your personal Google Sheet. Every time you add, update, or delete data in the app, it will automatically update your Google Sheet.

## Quick Setup (5 minutes)

### Step 1: Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it something like "Bakery App Data"
4. **Copy the Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` (the long string between `/d/` and `/edit`)

### Step 2: Create Google Apps Script

1. In your Google Spreadsheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste this code:

```javascript
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const spreadsheetId = requestData.spreadsheetId;
    const sheetName = requestData.sheetName;
    const values = requestData.values;
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get or create the sheet
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Clear existing data and write new data
    sheet.clear();
    if (values && values.length > 0) {
      sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true,
      message: `Synced ${values.length} rows to ${sheetName}` 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾 icon or Ctrl+S / Cmd+S)
5. Give it a name like "Bakery App Sync"

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - **Description**: "Bakery App Sync"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (or "Anyone with Google account" for more security)
5. Click **Deploy**
6. **Authorize access** when prompted:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [Your Project] (unsafe)" if shown
   - Click "Allow"
7. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### Step 4: Configure the App

1. Open `src/environments/environment.ts` in your project
2. Update the configuration:

```typescript
export const environment = {
  production: false,
  googleSheets: {
    enabled: true, // Change to true
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', // Paste your spreadsheet ID
    appsScriptUrl: 'YOUR_APPS_SCRIPT_URL_HERE' // Paste your Apps Script URL
  }
};
```

3. For production, also update `src/environments/environment.prod.ts` with the same values

### Step 5: Test It!

1. Restart your app: `npm start`
2. Create a new order or expense
3. Check your Google Sheet - you should see the data appear automatically! 🎉

## How It Works

- **Automatic Sync**: Every time you add, update, or delete data, it syncs to Google Sheets
- **Three Sheets**: Creates three sheets automatically:
  - **Orders** - All your orders
  - **Customers** - Customer information
  - **Expenses** - Expense records
- **Real-time**: Updates happen immediately when you save
- **Backup**: Data is still saved locally, Google Sheets is an additional backup

## Troubleshooting

### Data Not Syncing

1. **Check browser console** (F12 → Console) for errors
2. **Verify configuration**:
   - `enabled: true` in environment.ts
   - Spreadsheet ID is correct
   - Apps Script URL is correct
3. **Test Apps Script**:
   - Go back to Apps Script editor
   - Click "Run" → Select `doPost` function
   - Check for any errors

### "Authorization Required" Error

- Make sure you authorized the Apps Script when deploying
- Try redeploying and authorizing again
- Check that "Execute as: Me" is selected

### Sheets Not Created

- The script creates sheets automatically
- If sheets don't appear, check Apps Script execution logs
- Make sure the spreadsheet ID is correct

### Sync Fails Silently

- Check browser console for error messages
- Data still saves locally even if sync fails
- Try testing the Apps Script URL directly in a browser (should show an error about POST method)

## Security Notes

- Your Apps Script URL is public, but only you can write to your spreadsheet
- The script requires authorization to access your Google Sheets
- Keep your spreadsheet ID and Apps Script URL private
- Don't commit `environment.ts` with your credentials to public repositories

## Updating the Script

If you need to update the Apps Script code:

1. Make your changes in Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Click **New version**
5. Click **Deploy**
6. The URL stays the same - no need to update environment.ts

## Data Format

The app creates three sheets with these columns:

### Orders Sheet
- id, customerName, customerPhone, customerEmail, cakeType, quantity, price, otherDetails, cakeImage, hasDelivery, deliveryAddress, deliveryDate, orderDate, status, isEggless

### Customers Sheet
- id, name, phone, email, firstOrderDate

### Expenses Sheet
- id, description, amount, date, category

## Benefits

✅ **Automatic Backup** - Your data is always backed up in Google Sheets  
✅ **Access Anywhere** - View your data in Google Sheets from any device  
✅ **No Manual Export** - Everything syncs automatically  
✅ **Works Offline** - App works offline, syncs when online  
✅ **Safe** - Data still saved locally even if sync fails  

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all setup steps were completed correctly
3. Test the Apps Script URL manually
4. Ensure the spreadsheet ID is correct

Enjoy automatic syncing! 🚀

