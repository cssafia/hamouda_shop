// src/utils/media.js


function getServerOrigin() {
  const api = import.meta.env.VITE_API_BASE_URL || '';
  if (!api) return '';
  try {
    return new URL(api).origin;
  } catch {
    return '';
  }
}

const SERVER_ORIGIN = getServerOrigin();

/**
 * Build a full URL for a media path returned by the API.
 *
 *   imageUrl('/uploads/abc.jpg')           → 'http://localhost:4000/uploads/abc.jpg'
 *   imageUrl('uploads/abc.jpg')            → 'http://localhost:4000/uploads/abc.jpg'
 *   imageUrl('https://cdn.com/x.jpg')      → 'https://cdn.com/x.jpg'  (already absolute)
 *   imageUrl(null)                         → null
 */
export function imageUrl(path) {
  if (!path) return null;

  // Already absolute (http, https, data:, blob:)
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  // Ensure exactly one leading slash
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_ORIGIN}${clean}`;
}

/**
 * Same as imageUrl but for arrays of image objects (e.g. product.images).
 * Adds a `url` field already prefixed.
 */
export function mapImageUrls(images) {
  if (!Array.isArray(images)) return [];
  return images.map((img) => ({
    ...img,
    url: imageUrl(img.url),
  }));
}

/**
 * Map a product-like object: prefixes `primary_image` and any nested `images`.
 * Safe to call on list items or a single product.
 */
export function mapProductImages(product) {
  if (!product) return product;
  return {
    ...product,
    primary_image: imageUrl(product.primary_image),
    ...(Array.isArray(product.images)
      ? { images: mapImageUrls(product.images) }
      : {}),
  };
}