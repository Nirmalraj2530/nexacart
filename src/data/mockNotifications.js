/**
 * DEMO DATA — Static Notifications
 * These are sample notifications for the notification centre.
 * No real notification API exists in the backend.
 */

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "order",
    icon: "package",
    title: "Order Delivered!",
    message: "Your order NEXA-100001 has been delivered successfully. We hope you love it!",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    isRead: true,
    actionLabel: "View Order",
    actionHref: "/account/orders/NEXA-100001",
  },
  {
    id: "notif-2",
    type: "order",
    icon: "truck",
    title: "Order Shipped",
    message: "Your order NEXA-100002 is on its way! Estimated delivery in 2 days. Tracking ID: TRK-LA-55230",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isRead: false,
    actionLabel: "Track Order",
    actionHref: "/account/orders/NEXA-100002",
  },
  {
    id: "notif-3",
    type: "promo",
    icon: "tag",
    title: "Flash Sale is Live! 🔥",
    message: "Use code NEXA20 and get flat 20% off on everything. Offer valid for the next 12 hours only!",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isRead: false,
    actionLabel: "Shop Now",
    actionHref: "/products",
  },
  {
    id: "notif-4",
    type: "system",
    icon: "shield",
    title: "Account Security Update",
    message: "Your account password was last changed 90 days ago. We recommend updating it regularly for security.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    isRead: true,
    actionLabel: null,
    actionHref: null,
  },
  {
    id: "notif-5",
    type: "wishlist",
    icon: "heart",
    title: "Wishlist Item Back in Stock",
    message: "Great news! 'Wireless Over-Ear Headphones' from your wishlist is back in stock. Grab it before it sells out!",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    isRead: false,
    actionLabel: "View Product",
    actionHref: "/products",
  },
  {
    id: "notif-6",
    type: "refund",
    icon: "refresh-cw",
    title: "Refund Processed",
    message: "Your refund of $193.60 for order NEXA-100004 has been processed and will reflect in your account within 5-7 business days.",
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    isRead: true,
    actionLabel: "View Order",
    actionHref: "/account/orders/NEXA-100004",
  },
  {
    id: "notif-7",
    type: "review",
    icon: "star",
    title: "Rate Your Recent Purchase",
    message: "How was your experience with 'Classic Leather Sneaker'? Share your review and help others make better choices.",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    isRead: false,
    actionLabel: "Write Review",
    actionHref: "/products",
  },
];

/**
 * Load notifications from localStorage, seeding with demo data on first load.
 */
export function loadNotifications() {
  if (typeof window === "undefined") return DEMO_NOTIFICATIONS;
  try {
    const stored = localStorage.getItem("nexacart_notifications");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("nexacart_notifications", JSON.stringify(DEMO_NOTIFICATIONS));
    return DEMO_NOTIFICATIONS;
  } catch {
    return DEMO_NOTIFICATIONS;
  }
}

/**
 * Marks a notification as read and saves to localStorage.
 */
export function markNotificationRead(id) {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
  if (typeof window !== "undefined") {
    localStorage.setItem("nexacart_notifications", JSON.stringify(updated));
  }
  return updated;
}

/**
 * Marks all notifications as read.
 */
export function markAllNotificationsRead() {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => ({ ...n, isRead: true }));
  if (typeof window !== "undefined") {
    localStorage.setItem("nexacart_notifications", JSON.stringify(updated));
  }
  return updated;
}
