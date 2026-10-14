import { createSlice } from "@reduxjs/toolkit";
import { SEED_DEMO_ORDERS, loadOrders, saveOrders, ORDER_STATUSES } from "@/data/mockOrders";

const initialState = {
  orders: [],
  isHydrated: false,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    hydrateOrders: (state) => {
      state.orders = loadOrders();
      state.isHydrated = true;
    },
    placeOrder: (state, action) => {
      const order = action.payload;
      state.orders = [order, ...state.orders];
      saveOrders(state.orders);
    },
    cancelOrder: (state, action) => {
      const { orderId, reason } = action.payload;
      state.orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: ORDER_STATUSES.CANCELLED,
              cancellationReason: reason || "Customer requested cancellation",
              updatedAt: new Date().toISOString(),
            }
          : o
      );
      saveOrders(state.orders);
    },
    requestReturn: (state, action) => {
      const { orderId, reason } = action.payload;
      state.orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: ORDER_STATUSES.RETURN_REQUESTED,
              returnReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : o
      );
      saveOrders(state.orders);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      state.orders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      saveOrders(state.orders);
    },
  },
});

export const {
  hydrateOrders,
  placeOrder,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
} = orderSlice.actions;

export const selectOrders = (state) => state.orders.orders;
export const selectOrderById = (orderId) => (state) =>
  state.orders.orders.find((o) => o.id === orderId);
export const selectOrdersIsHydrated = (state) => state.orders.isHydrated;

export default orderSlice.reducer;
