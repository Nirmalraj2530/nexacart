/**
 * Formats a number as USD currency.
 */
export function formatCurrency(amount) {
  const numeric = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Curated high-resolution professional product photography collections by category.
 * Used to replace broken, missing, or low-quality grey placeholders (like 600x400).
 */
export const CATEGORY_IMAGE_COLLECTIONS = {
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", // Nike Red Sneaker
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80", // Streetwear Minimalist Sneaker
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80", // White Chunky Sneaker
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80", // Puma Retro Classic
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80", // Neon Green Athletic Shoe
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80", // Classic Black Vans Skate Shoe
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80", // Colorblock Urban Sneaker
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&auto=format&fit=crop&q=80", // Nike Air Max Cushion
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80", // Premium Leather Ankle Boots
  ],
  clothes: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80", // Minimalist White Tee
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80", // Black Leather Moto Jacket
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80", // Vintage Denim Jacket
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80", // Casual Linen Shirt
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80", // Knit Wool Cardigan
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80", // Streetwear Graphic Top
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80", // Tailored Overcoat
  ],
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", // Studio Wireless Headphones
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", // Minimalist White Smartwatch
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80", // Classic Film Camera
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80", // Fitness Band Smartwatch
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80", // Modern Slim Laptop
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80", // True Wireless Earbuds
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80", // Flagship Smartphone
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80", // Emerald Velvet Sofa
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80", // Scandinavian Armchair
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80", // Minimalist Bed Frame
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80", // Solid Oak Desk
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80", // Modern Room Lighting & Table
  ],
  miscellaneous: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80", // Organic Skincare Serum
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80", // Glass Bottle Perfume
    "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80", // Leather Crossbody Bag
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80", // Designer Handbag
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80", // Aviator Sunglasses
  ],
};

/**
 * Checks if a given image URL is an unappealing or broken placeholder (e.g., placehold.co 600x400).
 */
export function isDummyPlaceholder(url) {
  if (!url || typeof url !== "string") return true;
  const lower = url.toLowerCase().trim();
  if (!lower.startsWith("http://") && !lower.startsWith("https://")) return true;
  return (
    lower.includes("placehold.co") ||
    lower.includes("via.placeholder") ||
    lower.includes("placeholder") ||
    lower.includes("dummyimage") ||
    lower.includes("600x400") ||
    lower.includes("picsum.photos") ||
    lower.includes("smith.info") ||
    lower.includes("example.com") ||
    lower.includes("pravatar.cc") ||
    lower.includes("loremflickr")
  );
}

/**
 * Returns a deterministic, beautiful curated image based on category and optional seed (id/title).
 */
export function getCategoryCuratedImage(categoryName = "general", seed = "0") {
  const norm = String(categoryName || "").toLowerCase();
  let list = CATEGORY_IMAGE_COLLECTIONS.miscellaneous;
  if (norm.includes("shoe") || norm.includes("footwear") || norm.includes("sneaker")) {
    list = CATEGORY_IMAGE_COLLECTIONS.shoes;
  } else if (norm.includes("cloth") || norm.includes("apparel") || norm.includes("wear") || norm.includes("fashion")) {
    list = CATEGORY_IMAGE_COLLECTIONS.clothes;
  } else if (norm.includes("elect") || norm.includes("tech") || norm.includes("gadget") || norm.includes("phone")) {
    list = CATEGORY_IMAGE_COLLECTIONS.electronics;
  } else if (norm.includes("furn") || norm.includes("home") || norm.includes("decor") || norm.includes("interior")) {
    list = CATEGORY_IMAGE_COLLECTIONS.furniture;
  }

  // Deterministic seed hashing
  const seedStr = String(seed || "0");
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 10000;
  }
  return list[Math.abs(hash) % list.length];
}

/**
 * Cleans image URLs returned by Platzi EscuelaJS API or external sources.
 * If the image is missing, broken, or a dull 600x400 placeholder, replaces it with
 * a high-resolution, category-matching product photo.
 */
export function cleanImageUrl(images, fallback, contextHint) {
  let categoryHint = contextHint;
  let seedHint = contextHint;
  let input = images;

  // Handle if full product object was passed: cleanImageUrl(product)
  if (images && typeof images === "object" && !Array.isArray(images) && (images.images || images.image || images.title)) {
    categoryHint = images.category?.name || images.category || contextHint;
    seedHint = images.id || images.title || contextHint;
    input = images.images || images.image;
  }

  const defaultFallback = getCategoryCuratedImage(categoryHint, seedHint || "0");
  const finalFallback = fallback || defaultFallback;

  if (!input) return finalFallback;

  let rawUrl = "";
  if (Array.isArray(input)) {
    rawUrl = input[0] || "";
  } else if (typeof input === "string") {
    rawUrl = input;
  }

  if (!rawUrl) return finalFallback;

  // Handle double encoded JSON strings like "[\"https://...\"]"
  if (typeof rawUrl === "string" && (rawUrl.startsWith("[") || rawUrl.startsWith('["'))) {
    try {
      const parsed = JSON.parse(rawUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawUrl = parsed[0];
      }
    } catch {
      rawUrl = rawUrl.replace(/[[\]"']/g, "");
    }
  }

  // Remove trailing or leading quotes
  rawUrl = String(rawUrl).trim().replace(/^["']|["']$/g, "");

  // Detect ugly / broken placeholders (e.g. placehold.co/600x400)
  if (isDummyPlaceholder(rawUrl)) {
    return finalFallback;
  }

  // Validate URL protocol
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  return finalFallback;
}

/**
 * Truncates text to maximum character length.
 */
export function truncateText(text, maxLength = 80) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Exports an array of product objects into a downloadable CSV file.
 */
export function exportProductsToCSV(products, filename = "nexacart_products.csv") {
  if (!products || !Array.isArray(products) || products.length === 0) return;
  const headers = ["ID", "Title", "Price USD", "Category", "Description"];
  const rows = products.map((p) => [
    `"${p.id}"`,
    `"${(p.title || "").replace(/"/g, '""')}"`,
    `"${p.price || 0}"`,
    `"${(p.category?.name || "General").replace(/"/g, '""')}"`,
    `"${(p.description || "").replace(/"/g, '""').substring(0, 150)}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

