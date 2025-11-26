# Google Drive Image Storage Setup

This guide will help you set up Google Drive to store images for your bakery app.

## Why Google Drive?

- ✅ **No size limits** - Store full-quality images
- ✅ **Syncs across devices** - Images accessible from anywhere
- ✅ **Organized storage** - All images in one folder
- ✅ **Direct image URLs** - Fast loading

## Step 1: Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "Bakery App Images")
3. Right-click the folder → **Share** → **Change to "Anyone with the link"**
   - This is required for direct image URLs to work
4. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

## Step 2: Update Environment Configuration

Update your `src/environments/environment.ts` and `environment.prod.ts`:

```typescript
export const environment = {
  production: false, // or true for prod
  googleSheets: {
    enabled: true,
    spreadsheetId: "YOUR_SPREADSHEET_ID",
    appsScriptUrl: "YOUR_APPS_SCRIPT_URL",
  },
  googleDrive: {
    enabled: true, // Set to true to enable
    folderId: "YOUR_FOLDER_ID_HERE", // Paste folder ID from Step 1
  },
};
```

## Step 3: Update Google Apps Script

You need to add image upload functionality to your Apps Script.

### Complete Apps Script Code

Copy the **ENTIRE** code from `COMPLETE_APPS_SCRIPT_CODE.md` - it now includes:
- `doPost` - Handles both Sheets sync and Drive uploads
- `doGet` - Handles data fetching
- `doOptions` - Handles CORS preflight
- `handleImageUpload` - New function for Drive uploads

**Important:** The `handleImageUpload` function:
- Uploads images to your specified Drive folder
- Makes files publicly viewable (required for direct URLs)
- Returns the file ID and URL

## Step 4: Deploy Updated Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Open your project
3. Replace ALL code with the updated version from `COMPLETE_APPS_SCRIPT_CODE.md`
4. **Save** the script
5. **Deploy** → **Manage deployments**
6. Click **✏️ Edit** → **New version** → **Deploy**

## Step 5: Test

1. Create a new order with an image
2. Check your Google Drive folder - the image should appear
3. The image should display in the app using the Drive URL

## How It Works

### When Uploading Images:

1. **Compress** - Image is compressed to 800x800px, 70% quality
2. **Upload to Drive** - Compressed image uploaded to your Drive folder
3. **Store File ID** - Drive file ID stored in Google Sheets (instead of base64)
4. **Display** - Image displayed using Drive direct URL

### When Fetching Data:

1. **Fetch from Sheets** - Order data (including Drive file IDs) fetched
2. **Display Images** - Images loaded from Drive using file IDs
3. **Fallback** - If Drive ID not found, falls back to base64 (if available)

## Image URL Format

Images are accessed using:
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

This provides direct image access without requiring Google Drive login.

## Troubleshooting

### Images Not Showing

1. **Check folder sharing**: Folder must be "Anyone with the link"
2. **Check file sharing**: Files are auto-shared, but verify in Drive
3. **Check file ID**: Verify the file ID is correct in Google Sheets
4. **Check browser console**: Look for image loading errors

### Upload Failing

1. **Check Apps Script**: Make sure `handleImageUpload` function exists
2. **Check folder ID**: Verify folder ID is correct in environment.ts
3. **Check permissions**: Apps Script needs Drive API access
4. **Run Apps Script manually**: Test `handleImageUpload` function in editor

### CORS Errors

- The updated Apps Script includes CORS headers
- Make sure you created a new deployment version
- Wait 1-2 minutes after deploying

## Benefits

✅ **Images sync across all devices**  
✅ **No size limits** (unlike Google Sheets)  
✅ **Organized storage** in one folder  
✅ **Fast loading** with direct URLs  
✅ **Backup** - Images stored in your Drive  

## Next Steps

1. Set up your Drive folder
2. Update environment files with folder ID
3. Update Apps Script code
4. Test image upload
5. Enjoy synced images! 🎉

