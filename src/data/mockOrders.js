/**
 * DEMO DATA — Mock Orders
 * These are sample orders used for frontend demonstration only.
 * No real orders are stored or processed.
 */

export const ORDER_STATUSES = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  REFUND_INITIATED: "Refund Initiated",
  REFUNDED: "Refunded",
};

export const PAYMENT_METHODS = {
  COD: "Cash on Delivery",
  UPI: "UPI Payment",
  CARD: "Credit / Debit Card",
  NET_BANKING: "Net Banking",
};

/**
 * Generates a timeline for a given order status.
 */
export function getOrderTimeline(status, createdAt) {
  const base = new Date(createdAt);
  const add = (days, hours = 0) => new Date(base.getTime() + (days * 86400 + hours * 3600) * 1000).toISOString();

  const allSteps = [
    { label: "Order Placed", time: base.toISOString(), done: true, icon: "check" },
    { label: "Order Confirmed", time: add(0, 2), done: false, icon: "check" },
    { label: "Processing", time: add(1), done: false, icon: "cog" },
    { label: "Shipped", time: add(2), done: false, icon: "truck" },
    { label: "Out for Delivery", time: add(4), done: false, icon: "map-pin" },
    { label: "Delivered", time: add(5), done: false, icon: "package" },
  ];

  const completedMap = {
    [ORDER_STATUSES.PENDING]: 1,
    [ORDER_STATUSES.CONFIRMED]: 2,
    [ORDER_STATUSES.PROCESSING]: 3,
    [ORDER_STATUSES.SHIPPED]: 4,
    [ORDER_STATUSES.OUT_FOR_DELIVERY]: 5,
    [ORDER_STATUSES.DELIVERED]: 6,
  };

  const completedCount = completedMap[status] || 1;
  return allSteps.map((step, idx) => ({ ...step, done: idx < completedCount }));
}

/**
 * Initial seed demo orders.
 * Stored in localStorage under "nexacart_orders".
 */
export const SEED_DEMO_ORDERS = [
  {
    id: "NEXA-100001",
    userId: null,
    status: ORDER_STATUSES.DELIVERED,
    paymentMethod: PAYMENT_METHODS.CARD,
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    items: [
      { id: 1, title: "Classic Leather Sneaker", price: 89.99, quantity: 1, image: null, categoryName: "Shoes" },
      { id: 3, title: "Wireless Over-Ear Headphones", price: 149.99, quantity: 1, image: null, categoryName: "Electronics" },
    ],
    subtotal: 239.98,
    discount: 47.996,
    coupon: "NEXA20",
    shippingFee: 0,
    tax: 19.2,
    total: 211.2,
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "San Francisco",
      state: "California",
      pincode: "94103",
      country: "United States",
      phone: "+1 (555) 000-0000",
    },
    estimatedDelivery: new Date(Date.now() - 10 * 86400000).toISOString(),
    trackingId: "TRK-SF-88421",
    isDemoOrder: true,
  },
  {
    id: "NEXA-100002",
    userId: null,
    status: ORDER_STATUSES.SHIPPED,
    paymentMethod: PAYMENT_METHODS.UPI,
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    items: [
      { id: 5, title: "Vintage Denim Jacket", price: 129.99, quantity: 2, image: null, categoryName: "Clothes" },
    ],
    subtotal: 259.98,
    discount: 0,
    coupon: null,
    shippingFee: 0,
    tax: 20.8,
    total: 280.78,
    shippingAddress: {
      fullName: "John Doe",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      state: "California",
      pincode: "90001",
      country: "United States",
      phone: "+1 (555) 111-2222",
    },
    estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
    trackingId: "TRK-LA-55230",
    isDemoOrder: true,
  },
  {
    id: "NEXA-100003",
    userId: null,
    status: ORDER_STATUSES.PENDING,
    paymentMethod: PAYMENT_METHODS.COD,
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    items: [
      { id: 7, title: "Minimalist White Smartwatch", price: 199.99, quantity: 1, image: null, categoryName: "Electronics" },
    ],
    subtotal: 199.99,
    discount: 0,
    coupon: null,
    shippingFee: 10,
    tax: 16.0,
    total: 225.99,
    shippingAddress: {
      fullName: "John Doe",
      address: "789 Pine Road",
      city: "New York",
      state: "New York",
      pincode: "10001",
      country: "United States",
      phone: "+1 (555) 333-4444",
    },
    estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    trackingId: null,
    isDemoOrder: true,
  },
  {
    id: "NEXA-100004",
    userId: null,
    status: ORDER_STATUSES.CANCELLED,
    paymentMethod: PAYMENT_METHODS.NET_BANKING,
    paymentStatus: "Refunded",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    items: [
      { id: 9, title: "Premium Leather Ankle Boot", price: 219.99, quantity: 1, image: null, categoryName: "Shoes" },
    ],
    subtotal: 219.99,
    discount: 43.998,
    coupon: "NEXA20",
    shippingFee: 0,
    tax: 17.6,
    total: 193.6,
    shippingAddress: {
      fullName: "John Doe",
      address: "321 Elm Street",
      city: "Chicago",
      state: "Illinois",
      pincode: "60601",
      country: "United States",
      phone: "+1 (555) 555-6666",
    },
    estimatedDelivery: null,
    trackingId: null,
    cancellationReason: "Customer requested cancellation",
    isDemoOrder: true,
  },
];

/**
 * Load orders from localStorage, seeding with demo data on first load.
 */
export function loadOrders() {
  if (typeof window === "undefined") return SEED_DEMO_ORDERS;
  try {
    const stored = localStorage.getItem("nexacart_orders");
    if (stored) return JSON.parse(stored);
    // First visit: seed with demo orders
    localStorage.setItem("nexacart_orders", JSON.stringify(SEED_DEMO_ORDERS));
    return SEED_DEMO_ORDERS;
  } catch {
    return SEED_DEMO_ORDERS;
  }
}

/**
 * Saves orders array to localStorage.
 */
export function saveOrders(orders) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("nexacart_orders", JSON.stringify(orders));
  } catch {}
}

/**
 * Adds a new order to localStorage.
 */
export function addOrderToStorage(order) {
  const orders = loadOrders();
  const updated = [order, ...orders];
  saveOrders(updated);
  return updated;
}

/**
 * Updates the status of an order in localStorage.
 */
export function updateOrderStatus(orderId, newStatus) {
  const orders = loadOrders();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
  );
  saveOrders(updated);
  return updated;
}
