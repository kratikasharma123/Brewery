import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { apiUrl } from '../../utils/apiClient';

const initialState = {
  staff: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const authConfig = (getState) => ({
  headers: {
    Authorization: `Bearer ${getState().auth.user?.token}`,
  },
});

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || error.toString();

export const fetchStaff = createAsyncThunk('staff/fetchAll', async (filters = {}, thunkAPI) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await axios.get(apiUrl(`/api/staff?${params.toString()}`), authConfig(thunkAPI.getState));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const createStaff = createAsyncThunk('staff/create', async (staffData, thunkAPI) => {
  try {
    const response = await axios.post(apiUrl('/api/staff'), staffData, authConfig(thunkAPI.getState));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateStaff = createAsyncThunk('staff/update', async ({ id, staffData }, thunkAPI) => {
  try {
    const response = await axios.put(apiUrl(`/api/staff/${id}`), staffData, authConfig(thunkAPI.getState));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const deleteStaff = createAsyncThunk('staff/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(apiUrl(`/api/staff/${id}`), authConfig(thunkAPI.getState));
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const addAttendance = createAsyncThunk('staff/addAttendance', async ({ id, attendanceData }, thunkAPI) => {
  try {
    const response = await axios.post(apiUrl(`/api/staff/${id}/attendance`), attendanceData, authConfig(thunkAPI.getState));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    resetStaffState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = action.payload;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff.unshift(action.payload);
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = state.staff.map((member) => member._id === action.payload._id ? action.payload : member);
      })
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = state.staff.map((member) => member._id === action.payload._id ? action.payload : member);
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.staff = state.staff.filter((member) => member._id !== action.payload);
      })
      .addMatcher((action) => action.type.startsWith('staff/') && action.type.endsWith('/pending'), (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addMatcher((action) => action.type.startsWith('staff/') && action.type.endsWith('/rejected'), (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetStaffState } = staffSlice.actions;
export default staffSlice.reducer;
