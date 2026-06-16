import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiUrl } from '../../utils/apiClient';

const initialState = {
  orders: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const response = await fetch(apiUrl('/api/orders'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch orders');
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Unable to fetch orders');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const response = await fetch(apiUrl(`/api/orders/${orderId}/cancel`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to cancel order');
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Unable to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Unable to fetch orders';
      })
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.map((order) => (
          order._id === action.payload._id ? action.payload : order
        ));
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Unable to cancel order';
      });
  },
});

export default orderSlice.reducer;
