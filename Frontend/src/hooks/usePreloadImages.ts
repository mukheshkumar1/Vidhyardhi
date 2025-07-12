// src/hooks/usePreloadImages.ts
import { useEffect } from "react";

/**
 * Preloads an array of image URLs by creating new Image objects.
 * This prevents delays when rendering background or img elements later.
 * 
 * @param urls Array of image URLs (local imports or absolute URLs)
 */
export const usePreloadImages = (urls: string[]) => {
  useEffect(() => {
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [urls]);
};
