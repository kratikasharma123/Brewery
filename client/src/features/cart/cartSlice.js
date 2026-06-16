import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiUrl } from '../../utils/apiClient';

const CART_STORAGE_KEY = 'brewery_cart_items';

const loadCartItems = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const savedItems = localStorage.getItem(CART_STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch {
    return [];
  }
};

const saveCartItems = (items) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage failures so cart actions still work in memory.
  }
};

const initialState = {
  items: loadCartItems(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  lastOrder: null,
};

export const placeCodOrder = createAsyncThunk(
  'cart/placeCodOrder',
  async (deliveryDetails, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;
      const items = state.cart.items.map((item) => ({
        inventoryItem: item._id,
        quantity: item.cartQty,
      }));

      const response = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: 'COD', items, deliveryDetails }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to place order');
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Unable to place order');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item._id === product._id);
      if (existingItem) {
        existingItem.cartQty += product.cartQty || 1;
      } else {
        state.items.push({ ...product, cartQty: product.cartQty || 1 });
      }
      saveCartItems(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      saveCartItems(state.items);
    },
    updateCartQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((cartItem) => cartItem._id === id);
      if (item) {
        item.cartQty = Math.max(1, qty);
        saveCartItems(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCartItems(state.items);
    },
    resetCartStatus: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeCodOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(placeCodOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lastOrder = action.payload;
        state.message = 'Order placed successfully. Payment mode: Cash on Delivery.';
        state.items = [];
        saveCartItems(state.items);
      })
      .addCase(placeCodOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Unable to place order';
      });
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart, resetCartStatus } = cartSlice.actions;
export default cartSlice.reducer;
