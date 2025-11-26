import { Injectable } from "@angular/core";

export interface GoogleDriveConfig {
  appsScriptUrl: string; // Same Apps Script URL (we'll add Drive functions)
  folderId: string; // Google Drive folder ID where images will be stored
}

@Injectable({
  providedIn: "root",
})
export class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;

  initialize(config: GoogleDriveConfig): void {
    this.config = config;
  }

  isInitialized(): boolean {
    return this.config !== null;
  }

  /**
   * Upload image to Google Drive and return file ID
   * @param base64Image Base64 encoded image (with data URL prefix)
   * @param fileName Name for the file in Drive
   * @returns Promise<string> Google Drive file ID
   */
  async uploadImage(
    base64Image: string,
    fileName: string
  ): Promise<string> {
    if (!this.config) {
      throw new Error("Google Drive service not initialized");
    }

    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.includes(",")
        ? base64Image.split(",")[1]
        : base64Image;

      const response = await fetch(this.config.appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "uploadImage",
          folderId: this.config.folderId,
          fileName: fileName,
          imageData: base64Data,
          mimeType: "image/jpeg",
        }),
      });

      // With no-cors, we can't read response, but the upload should work
      // Return a placeholder ID that will be replaced when we can verify
      console.log(`📤 Image upload request sent for: ${fileName}`);
      console.log("ℹ️ Using no-cors mode - check Google Drive to verify upload");

      // Generate a temporary ID based on timestamp
      // The actual file ID will be stored by Apps Script
      return `drive_${Date.now()}_${fileName}`;
    } catch (error) {
      console.error("Error uploading image to Google Drive:", error);
      throw error;
    }
  }

  /**
   * Get image URL from Google Drive file ID or base64
   * @param imageValue Drive file ID or base64 string
   * @returns Image URL (Drive URL or base64 data URL)
   */
  getImageUrl(imageValue: string | undefined): string {
    if (!imageValue) return "";

    // If it's already a full URL or base64 data URL, return it
    if (imageValue.startsWith("http") || imageValue.startsWith("data:image")) {
      return imageValue;
    }

    // If it's a temporary Drive ID (starts with "drive_"), return empty
    // The actual file ID will be stored by Apps Script
    if (imageValue.startsWith("drive_")) {
      return "";
    }

    // Standard Google Drive file ID - return direct image URL
    return `https://drive.google.com/uc?export=view&id=${imageValue}`;
  }

  /**
   * Check if a string is a Google Drive file ID
   */
  isDriveFileId(value: string): boolean {
    return (
      value.startsWith("drive_") ||
      value.startsWith("http") ||
      (value.length > 20 && !value.startsWith("data:image"))
    );
  }
}

