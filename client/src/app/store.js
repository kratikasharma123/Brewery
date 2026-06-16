import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import bookingReducer from '../features/bookings/bookingSlice';
import cartReducer from '../features/cart/cartSlice';
import staffReducer from '../features/staff/staffSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import orderReducer from '../features/orders/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    booking: bookingReducer,
    cart: cartReducer,
    staff: staffReducer,
    dashboard: dashboardReducer,
    orders: orderReducer,
  },
});
