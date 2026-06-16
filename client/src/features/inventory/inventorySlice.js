import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { apiUrl } from '../../utils/apiClient';

const initialState = {
  items: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Helper function to build headers with auth token
const getAuthConfig = (getState) => {
  const token = getState().auth.user?.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Fetch inventory items
export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async (filters, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      // Construct query string
      let url = '/api/inventory';
      const params = [];
      if (filters) {
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
        if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
        if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await axios.get(apiUrl(url), config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new inventory item
export const createItem = createAsyncThunk(
  'inventory/create',
  async (itemData, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      const response = await axios.post(apiUrl('/api/inventory'), itemData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update inventory item
export const updateItem = createAsyncThunk(
  'inventory/update',
  async ({ id, itemData }, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      const response = await axios.put(apiUrl(`/api/inventory/${id}`), itemData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete inventory item
export const deleteItem = createAsyncThunk(
  'inventory/delete',
  async (id, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      await axios.delete(apiUrl(`/api/inventory/${id}`), config);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    resetInventoryState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Item
      .addCase(createItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items.unshift(action.payload); // Add new item to front of list
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Item
      .addCase(updateItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Item
      .addCase(deleteItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetInventoryState } = inventorySlice.actions;
export default inventorySlice.reducer;
