import { Injectable } from "@angular/core";

export interface CompressionResult {
  base64: string;
  sizeKB: number;
  exceededLimit: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ImageCompressionService {
  private readonly MAX_SIZE_KB = 50; // 50KB limit
  private readonly MAX_BASE64_LENGTH = 45000; // Google Sheets cell limit (~50KB)

  /**
   * Compress and resize image to base64, targeting under 50KB
   * @param file Image file to compress
   * @returns Promise<CompressionResult> Base64 encoded image with size info
   */
  async compressImage(file: File): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          // Start with reasonable dimensions and quality
          let maxWidth = 1200;
          let maxHeight = 1200;
          let quality = 0.8;

          // Calculate initial dimensions
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

          // Try compression with decreasing quality until we're under limit
          const tryCompress = (currentQuality: number): void => {
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

            // Convert to base64
            const base64 = canvas.toDataURL("image/jpeg", currentQuality);
            const sizeKB = this.getBase64SizeKB(base64);

            // If still too large and we can reduce quality/dimensions more
            if (sizeKB > this.MAX_SIZE_KB && currentQuality > 0.3) {
              // Reduce quality further
              tryCompress(Math.max(0.3, currentQuality - 0.1));
            } else if (sizeKB > this.MAX_SIZE_KB && width > 400) {
              // Reduce dimensions if quality is already low
              width = Math.floor(width * 0.8);
              height = Math.floor(height * 0.8);
              tryCompress(currentQuality);
            } else {
              // Check if base64 string length exceeds Google Sheets limit
              const exceededLimit = base64.length > this.MAX_BASE64_LENGTH || sizeKB > this.MAX_SIZE_KB;
              
              resolve({
                base64,
                sizeKB: Math.round(sizeKB * 100) / 100, // Round to 2 decimals
                exceededLimit,
              });
            }
          };

          tryCompress(quality);
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
   * Get size of base64 string in KB
   * @param base64 Base64 string
   * @returns Size in KB
   */
  getBase64SizeKB(base64: string): number {
    // Remove data URL prefix if present
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    // Base64 encoding: 4 chars = 3 bytes
    const sizeBytes = (base64Data.length * 3) / 4;
    return sizeBytes / 1024; // Convert to KB
  }

  /**
   * Check if base64 string is within 50KB limit
   * @param base64 Base64 string
   * @returns boolean
   */
  isWithinLimit(base64: string): boolean {
    return this.getBase64SizeKB(base64) <= this.MAX_SIZE_KB && base64.length <= this.MAX_BASE64_LENGTH;
  }
}

