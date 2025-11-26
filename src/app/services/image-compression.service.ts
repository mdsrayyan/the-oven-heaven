import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImageCompressionService {
  /**
   * Compress and resize image to base64
   * @param file Image file to compress
   * @param maxWidth Maximum width (default: 800px)
   * @param maxHeight Maximum height (default: 800px)
   * @param quality Compression quality 0-1 (default: 0.7)
   * @returns Promise<string> Base64 encoded image
   */
  async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.7
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Create canvas and compress
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Get estimated size of base64 string
   * @param base64 Base64 string
   * @returns Size in bytes
   */
  getBase64Size(base64: string): number {
    // Remove data URL prefix if present
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    // Base64 encoding increases size by ~33%
    return (base64Data.length * 3) / 4;
  }

  /**
   * Check if base64 string is within Google Sheets limit (~45k chars)
   * @param base64 Base64 string
   * @returns boolean
   */
  isWithinLimit(base64: string): boolean {
    return base64.length < 45000;
  }
}

