# Complete Google Apps Script Code

Copy this **ENTIRE** code into your Google Apps Script editor. Make sure you copy ALL of it, including both `doGet` and `doPost` functions.

```javascript
function doPost(e) {
  try {
    let requestData;
    
    // Handle JSON POST requests
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    }
    // Handle form-urlencoded requests
    else if (e.postData && e.postData.type === 'application/x-www-form-urlencoded') {
      const params = e.parameter;
      requestData = {
        spreadsheetId: params.spreadsheetId,
        sheetName: params.sheetName,
        values: JSON.parse(params.values)
      };
    } else {
      throw new Error('Unsupported request type');
    }
    
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
    
    // Return success response
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

## Step-by-Step Instructions

1. **Go to [Google Apps Script](https://script.google.com/)**
2. **Open your "Bakery App Sync" project**
3. **Delete ALL existing code** in the editor
4. **Copy and paste the ENTIRE code above** (both functions)
5. **Click Save** (💾 icon or Ctrl+S / Cmd+S)
6. **Click Run** → Select `doGet` → Click **Run** (▶️)
   - This will test the function and prompt for authorization if needed
   - Click "Authorize access" → Choose your account → "Allow"
7. **Click Deploy** → **Manage deployments**
8. **Click the pencil icon ✏️** next to your deployment
9. **Click "New version"**
10. **Click "Deploy"**
11. **Test the URL** - Open your Apps Script Web App URL in a new tab
    - You should see: `{"success":true,"message":"Apps Script is running. Use POST to sync data."}`
    - If you see this, it's working! ✅

## Important Notes

- ✅ **Both functions are required**: `doGet` (for testing) and `doPost` (for syncing)
- ✅ **Make sure you copy BOTH functions**
- ✅ **After updating code, create a NEW VERSION of the deployment**
- ✅ **The URL stays the same** - no need to update environment.ts

## Troubleshooting

### If you still see "Script function not found":
1. Make sure you copied BOTH `doGet` and `doPost` functions
2. Check for typos in function names (case-sensitive)
3. Save the script
4. Create a new deployment version
5. Wait 1-2 minutes and try again

### If you see authorization errors:
1. Run `doGet` function in Apps Script editor
2. Authorize access when prompted
3. Create a new deployment version
4. Test the URL again

After following these steps, your Apps Script should work and data will sync to Google Sheets!

