/**
 * DEMO DATA — Mock Inventory & Low-Stock Alerts
 * These are sample inventory levels for admin panel demonstration only.
 * No real inventory API exists.
 */

export const MOCK_INVENTORY = [
  { categoryId: 1, categoryName: "Clothes", totalSKUs: 47, inStock: 38, lowStock: 6, outOfStock: 3, reserved: 12, warehouseLocation: "Warehouse A - Bay 3" },
  { categoryId: 2, categoryName: "Electronics", totalSKUs: 31, inStock: 22, lowStock: 5, outOfStock: 4, reserved: 8, warehouseLocation: "Warehouse B - Bay 1" },
  { categoryId: 3, categoryName: "Furniture", totalSKUs: 18, inStock: 14, lowStock: 2, outOfStock: 2, reserved: 5, warehouseLocation: "Warehouse C - Floor 2" },
  { categoryId: 4, categoryName: "Shoes", totalSKUs: 62, inStock: 50, lowStock: 9, outOfStock: 3, reserved: 18, warehouseLocation: "Warehouse A - Bay 7" },
  { categoryId: 5, categoryName: "Miscellaneous", totalSKUs: 25, inStock: 19, lowStock: 4, outOfStock: 2, reserved: 6, warehouseLocation: "Warehouse B - Bay 5" },
];

export const LOW_STOCK_ALERTS = [
  { productId: 1, productTitle: "Classic Leather Sneaker", category: "Shoes", currentStock: 3, reorderLevel: 10, status: "critical", lastRestocked: new Date(Date.now() - 45 * 86400000).toISOString() },
  { productId: 4, productTitle: "Wireless Noise-Cancelling Headphones", category: "Electronics", currentStock: 5, reorderLevel: 15, status: "low", lastRestocked: new Date(Date.now() - 30 * 86400000).toISOString() },
  { productId: 7, productTitle: "Vintage Denim Jacket — Large", category: "Clothes", currentStock: 2, reorderLevel: 8, status: "critical", lastRestocked: new Date(Date.now() - 20 * 86400000).toISOString() },
  { productId: 11, productTitle: "Ergonomic Office Chair", category: "Furniture", currentStock: 4, reorderLevel: 10, status: "low", lastRestocked: new Date(Date.now() - 15 * 86400000).toISOString() },
  { productId: 15, productTitle: "Premium Smartwatch Series 5", category: "Electronics", currentStock: 1, reorderLevel: 8, status: "critical", lastRestocked: new Date(Date.now() - 60 * 86400000).toISOString() },
  { productId: 19, productTitle: "Casual Linen Shirt — XL", category: "Clothes", currentStock: 6, reorderLevel: 12, status: "low", lastRestocked: new Date(Date.now() - 25 * 86400000).toISOString() },
  { productId: 22, productTitle: "Retro Running Shoe — Size 10", category: "Shoes", currentStock: 3, reorderLevel: 10, status: "low", lastRestocked: new Date(Date.now() - 10 * 86400000).toISOString() },
];

/**
 * Demo sales data for admin dashboard charts.
 * Represents last 7 days of simulated revenue.
 */
export const DEMO_SALES_DATA = [
  { date: "Oct 7", day: "Mon", revenue: 1248.5, orders: 14 },
  { date: "Oct 8", day: "Tue", revenue: 876.25, orders: 9 },
  { date: "Oct 9", day: "Wed", revenue: 2134.0, orders: 23 },
  { date: "Oct 10", day: "Thu", revenue: 1567.75, orders: 18 },
  { date: "Oct 11", day: "Fri", revenue: 3210.0, orders: 31 },
  { date: "Oct 12", day: "Sat", revenue: 2890.5, orders: 27 },
  { date: "Oct 13", day: "Sun", revenue: 1756.0, orders: 19 },
];

export const DEMO_KPI = {
  totalRevenue: 13682.0,
  revenueGrowth: 18.4,
  totalOrders: 141,
  ordersGrowth: 12.5,
  avgOrderValue: 97.03,
  avgOrderGrowth: 5.2,
  totalCustomers: 87,
  customersGrowth: 22.1,
  pendingOrders: 12,
  shippedOrders: 34,
  deliveredOrders: 87,
  cancelledOrders: 8,
  returnRequests: 4,
  isDemoData: true,
};

/**
 * Demo return/refund requests for admin panel.
 */
export const DEMO_RETURNS = [
  { id: "RET-001", orderId: "NEXA-100004", customer: "John Doe", product: "Premium Leather Ankle Boot", reason: "Wrong size delivered", amount: 193.6, status: "Refunded", createdAt: new Date(Date.now() - 18 * 86400000).toISOString(), isDemoData: true },
  { id: "RET-002", orderId: "NEXA-200017", customer: "Sarah K.", product: "Wireless Headphones", reason: "Defective product", amount: 149.99, status: "Return Requested", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), isDemoData: true },
  { id: "RET-003", orderId: "NEXA-200031", customer: "Mike P.", product: "Denim Jacket — Medium", reason: "Not as described", amount: 129.99, status: "Processing", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), isDemoData: true },
  { id: "RET-004", orderId: "NEXA-200009", customer: "Priya S.", product: "Smartwatch Series 3", reason: "Changed mind", amount: 199.99, status: "Refund Initiated", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), isDemoData: true },
];
