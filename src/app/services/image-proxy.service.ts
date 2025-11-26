import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ImageProxyService {
  /**
   * Get proxied image URL to bypass CORS restrictions
   * Uses a free CORS proxy service
   */
  getProxiedUrl(originalUrl: string): string {
    if (!originalUrl || !originalUrl.trim()) {
      return "";
    }

    try {
      const url = new URL(originalUrl);
      
      // Extract actual URL from Google Images redirect URLs
      if (url.searchParams.has("url")) {
        const actualUrl = url.searchParams.get("url");
        if (actualUrl) {
          return this.proxyUrl(decodeURIComponent(actualUrl));
        }
      }

      // Use proxy for all URLs to avoid CORS issues
      return this.proxyUrl(originalUrl);
    } catch (error) {
      // If URL parsing fails, return original
      return originalUrl;
    }
  }

  /**
   * Proxy URL using a CORS proxy service
   * Using images.weserv.nl - a free, reliable image proxy
   */
  private proxyUrl(url: string): string {
    // Encode the URL
    const encodedUrl = encodeURIComponent(url);
    
    // Use images.weserv.nl proxy (free, no API key needed)
    // This service proxies images and adds CORS headers
    return `https://images.weserv.nl/?url=${encodedUrl}`;
  }

  /**
   * Check if URL is a Google Images redirect
   */
  isGoogleImagesUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes("google.com") &&
        urlObj.searchParams.has("url")
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract actual image URL from Google Images redirect
   */
  extractGoogleImageUrl(googleUrl: string): string | null {
    try {
      const url = new URL(googleUrl);
      if (url.searchParams.has("url")) {
        return decodeURIComponent(url.searchParams.get("url") || "");
      }
    } catch {
      // Invalid URL
    }
    return null;
  }
}

