import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { apiUrl } from '../../utils/apiClient';

const initialState = {
  bookings: [],
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

// Fetch bookings
export const fetchBookings = createAsyncThunk(
  'booking/fetchAll',
  async (filters, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      let url = '/api/bookings';
      const params = [];
      if (filters) {
        if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
        if (filters.type) params.push(`type=${encodeURIComponent(filters.type)}`);
        if (filters.date) params.push(`date=${encodeURIComponent(filters.date)}`);
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

// Create new booking
export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      const response = await axios.post(apiUrl('/api/bookings'), bookingData, config);
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

// Update booking
export const updateBooking = createAsyncThunk(
  'booking/update',
  async ({ id, bookingData }, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      const response = await axios.put(apiUrl(`/api/bookings/${id}`), bookingData, config);
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

// Delete booking
export const deleteBooking = createAsyncThunk(
  'booking/delete',
  async (id, thunkAPI) => {
    try {
      const config = getAuthConfig(thunkAPI.getState);
      await axios.delete(apiUrl(`/api/bookings/${id}`), config);
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

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings.push(action.payload); // Add new booking to list
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookings = state.bookings.filter((booking) => booking._id !== action.payload);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
