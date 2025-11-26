# Google Sheets Data Fetching - Update Required

## What Changed

Your app now **fetches data from Google Sheets** when opened in a new browser, instead of starting fresh. This means:

✅ **Data persists across browsers** - Open the app on any device/browser and see all your data  
✅ **Automatic sync** - Data is loaded from Google Sheets on app startup  
✅ **Fallback support** - If Google Sheets fetch fails, it falls back to localStorage  

## Required: Update Your Google Apps Script

You **MUST** update your Google Apps Script code to support data fetching.

### Step 1: Open Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Open your "Bakery App Sync" project

### Step 2: Replace the `doGet` Function

Find the `doGet` function in your script and **replace it entirely** with this updated version:

```javascript
function doGet(e) {
  try {
    const action = e.parameter.action;
    const spreadsheetId = e.parameter.spreadsheetId;
    
    // If no action or spreadsheetId, return test message
    if (!action || !spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Apps Script is running. Use POST to sync data or GET with action=fetch to retrieve data.' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle fetch action
    if (action === 'fetch') {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const result = {
        orders: [],
        customers: [],
        expenses: []
      };
      
      // Fetch Orders sheet
      let sheet = spreadsheet.getSheetByName('Orders');
      if (sheet && sheet.getLastRow() > 1) {
        const ordersData = sheet.getDataRange().getValues();
        result.orders = ordersData;
      }
      
      // Fetch Customers sheet
      sheet = spreadsheet.getSheetByName('Customers');
      if (sheet && sheet.getLastRow() > 1) {
        const customersData = sheet.getDataRange().getValues();
        result.customers = customersData;
      }
      
      // Fetch Expenses sheet
      sheet = spreadsheet.getSheetByName('Expenses');
      if (sheet && sheet.getLastRow() > 1) {
        const expensesData = sheet.getDataRange().getValues();
        result.expenses = expensesData;
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        ...result
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false,
      error: 'Unknown action' 
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

### Step 3: Keep Your `doPost` Function

**DO NOT** change your `doPost` function - keep it as is. Only update `doGet`.

### Step 4: Save and Deploy

1. **Click Save** (💾 icon or Ctrl+S / Cmd+S)
2. **Click Deploy** → **Manage deployments**
3. **Click the pencil icon ✏️** next to your deployment
4. **Click "New version"**
5. **Click "Deploy"**
6. Wait 1-2 minutes for the update to propagate

### Step 5: Test

1. Open your app in a **new browser** (or incognito mode)
2. Check the browser console (F12 → Console)
3. You should see: `📥 Attempting to fetch data from Google Sheets...`
4. Then: `✅ Loaded data from Google Sheets: { orders: X, customers: Y, expenses: Z }`
5. Your data should appear in the app!

## How It Works

### On App Startup:

1. **First**: Tries to fetch data from Google Sheets
2. **If successful**: Loads data from Google Sheets and saves to localStorage as backup
3. **If failed**: Falls back to localStorage (existing data or empty)

### When Saving:

1. Saves to localStorage immediately
2. Syncs to Google Sheets in the background
3. Other browsers/devices will fetch the latest data on next load

## Troubleshooting

### Data Not Loading from Google Sheets

1. **Check Apps Script is updated**: Make sure you updated `doGet` function
2. **Check deployment**: Create a new version after updating code
3. **Check browser console**: Look for error messages
4. **Verify Google Sheets has data**: Check your spreadsheet manually

### Still Seeing Empty Data

1. **First time setup**: If Google Sheets is empty, it will use localStorage
2. **Create some data**: Add an order, then check Google Sheets
3. **Open in new browser**: The new browser should fetch from Google Sheets

### CORS Errors

- The updated `doGet` function includes CORS headers
- Make sure you created a new deployment version
- Wait 1-2 minutes after deploying

## Benefits

✅ **Multi-device access** - Use the app on phone, tablet, desktop  
✅ **Data persistence** - Never lose your data  
✅ **Automatic sync** - Changes sync automatically  
✅ **Backup** - Data stored in both Google Sheets and localStorage  

---

**Important**: After updating your Apps Script, **create a new deployment version** for the changes to take effect!

