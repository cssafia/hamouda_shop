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

export function imageUrl(path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_ORIGIN}${clean}`;
}

export function mapImageUrls(images) {
  if (!Array.isArray(images)) return [];
  return images.map((img) => ({
    ...img,
    url: imageUrl(img.url),
  }));
}

export function mapProductImages(product) {
  if (!product) return product;

  const mapped = {
    ...product,
    primary_image: imageUrl(product.primary_image),
    ...(Array.isArray(product.images)
      ? { images: mapImageUrls(product.images) }
      : {}),
  };

  // Also map any nested variants' images if present
  if (Array.isArray(product.variants)) {
    mapped.variants = product.variants.map((v) => ({
      ...v,
      ...(v.primary_image !== undefined
        ? { primary_image: imageUrl(v.primary_image) }
        : {}),
      ...(Array.isArray(v.images) ? { images: mapImageUrls(v.images) } : {}),
    }));
  }

  return mapped;
}

/** Convenience helper for paginated lists: { items, meta } */
export function mapProductList(data) {
  if (!data) return data;
  return {
    ...data,
    items: (data.items ?? []).map(mapProductImages),
  };
}