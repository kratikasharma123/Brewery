import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { apiUrl } from '../../utils/apiClient';

const initialState = {
  summary: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchDashboardSummary = createAsyncThunk('dashboard/fetchSummary', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user?.token;
    console.log(token,"token")
    const response = await axios.get(apiUrl('/api/dashboard/summary'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response,"response")
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
