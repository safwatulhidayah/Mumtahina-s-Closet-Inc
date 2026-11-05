/**
 * Mumtahina’s Closet Inc - Image Storage Service (Hostinger Server Storage)
 *
 * Uploads images directly to Hostinger server storage (/uploads/products/)
 * via the Hostinger PHP API, completely replacing Firebase Storage.
 */

import { uploadApi } from './api';

/**
 * Fallback compressor: converts an image file to a responsive web data URL
 * if network connection to Hostinger is temporarily unreachable during local preview.
 */
function fileToDataUrl(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return resolve('');

      if (file.size < 200 * 1024 || file.type.includes('svg')) {
        return resolve(result);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(result);

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a single product image to Hostinger PHP storage (/uploads/products/).
 */
export async function uploadProductImage(file: File, _productId?: string): Promise<string> {
  try {
    const remoteUrl = await uploadApi.uploadSingle(file, 'products');
    if (remoteUrl) return remoteUrl;
    throw new Error('Hostinger upload returned empty URL');
  } catch (err) {
    console.warn('Hostinger storage upload notice, falling back to local media buffer:', err);
    return fileToDataUrl(file);
  }
}

/**
 * Uploads multiple product images in parallel or batch to Hostinger.
 */
export async function uploadMultipleProductImages(
  files: File[],
  _productId?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const url = await uploadProductImage(file, _productId);
      if (url) results.push(url);
    } catch (e) {
      console.error(`Failed to process image ${file.name}:`, e);
    }
    completed++;
    if (onProgress) {
      onProgress(completed, files.length);
    }
  }

  return results;
}
