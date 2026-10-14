/**
 * DEMO DATA — Static Product Reviews
 * These are sample reviews for frontend display only.
 * No real review API exists in the backend.
 */

const REVIEWER_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80",
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: "Absolutely love it!", body: "Exceeded all my expectations. The quality is outstanding and the delivery was super fast. Would definitely recommend to anyone!" },
  { rating: 5, title: "Perfect purchase!", body: "Exactly as described. Fits perfectly and looks even better in person. Great value for the price." },
  { rating: 4, title: "Great product, minor issue", body: "Really happy with this purchase overall. Build quality is solid. Shipping took a bit longer than expected but the product itself is worth it." },
  { rating: 4, title: "Good quality", body: "Solid construction and looks premium. Packaging was also very neat. Minor improvement could be made on the sizing guide." },
  { rating: 5, title: "Best I've ever bought", body: "I've tried several alternatives before, but this one blows them all out of the water. A definite game changer." },
  { rating: 3, title: "Decent but not perfect", body: "Product is okay. Not quite what I imagined from the photos but it works well. Customer support was responsive." },
  { rating: 5, title: "Highly recommend!", body: "Bought this as a gift and the recipient was thrilled. Premium feel and great attention to detail. Will buy again." },
  { rating: 4, title: "Worth every penny", body: "Compared to similar options, this is by far the best value. Arrived quickly and well-packaged." },
];

const REVIEWER_NAMES = [
  "Alex M.", "Sarah K.", "James R.", "Priya S.", "David L.", "Emma W.",
  "Carlos G.", "Nadia T.", "Michael P.", "Olivia H.",
];

/**
 * Returns deterministic demo reviews for a given product ID.
 * Uses a seed so the same product always gets the same reviews.
 */
export function getDemoReviews(productId, count = 5) {
  const seed = Number(String(productId).replace(/\D/g, "").slice(0, 6)) || 1;
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const idx = (seed * (i + 1) * 13) % REVIEW_TEMPLATES.length;
    const nameIdx = (seed * (i + 1) * 7) % REVIEWER_NAMES.length;
    const avatarIdx = (seed * (i + 1) * 11) % REVIEWER_AVATARS.length;
    const daysAgo = (seed * (i + 1) * 3) % 90 + 1;

    reviews.push({
      id: `review-${productId}-${i}`,
      reviewer: REVIEWER_NAMES[nameIdx],
      avatar: REVIEWER_AVATARS[avatarIdx],
      rating: REVIEW_TEMPLATES[idx].rating,
      title: REVIEW_TEMPLATES[idx].title,
      body: REVIEW_TEMPLATES[idx].body,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      verified: (seed + i) % 3 !== 0,
      helpful: Math.floor(((seed * (i + 1)) % 40)),
    });
  }

  return reviews;
}

/**
 * Computes aggregate rating summary for a product.
 */
export function getRatingSummary(productId) {
  const reviews = getDemoReviews(productId, 8);
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / total;

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });

  return { average: avg, total, distribution: dist };
}

/**
 * All admin-level demo reviews (for review moderation panel).
 */
export const ADMIN_DEMO_REVIEWS = Array.from({ length: 12 }, (_, i) => ({
  id: `admin-review-${i + 1}`,
  productId: (i % 5) + 1,
  productTitle: ["Classic Sneaker", "Wireless Headphones", "Denim Jacket", "Smartwatch", "Leather Boots"][i % 5],
  reviewer: REVIEWER_NAMES[i % REVIEWER_NAMES.length],
  avatar: REVIEWER_AVATARS[i % REVIEWER_AVATARS.length],
  rating: [5, 4, 5, 3, 4, 5, 4, 5, 3, 5, 4, 5][i],
  title: REVIEW_TEMPLATES[i % REVIEW_TEMPLATES.length].title,
  body: REVIEW_TEMPLATES[i % REVIEW_TEMPLATES.length].body,
  createdAt: new Date(Date.now() - (i + 1) * 2 * 86400000).toISOString(),
  status: i % 4 === 0 ? "pending" : "approved",
  verified: i % 3 !== 0,
  helpful: i * 3,
  isDemoData: true,
}));
