import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUser,
  logoutUser,
  registerUser,
  sendRecoveryEmail,
  syncUserWithBackend,
} from '../../services/Auth';

const savedUser = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: savedUser || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'User already exists';
    case 'auth/invalid-email':
      return 'Please provide a valid email address';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    default:
      return error?.response?.data?.message || error?.message || error?.toString() || 'Authentication failed';
  }
};

// Register user with Firebase Auth and sync MongoDB role/profile
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await registerUser(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getAuthErrorMessage(error));
    }
  }
);

// Choose user role and persist it to MongoDB
export const chooseRole = createAsyncThunk(
  'auth/chooseRole',
  async (role, thunkAPI) => {
    try {
      const currentUser = thunkAPI.getState().auth.user;
      return await syncUserWithBackend({ name: currentUser?.name, role });
    } catch (error) {
      return thunkAPI.rejectWithValue(getAuthErrorMessage(error));
    }
  }
);

// Login user with Firebase Auth and load MongoDB role/profile
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await loginUser(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getAuthErrorMessage(error));
    }
  }
);

// Send Firebase password recovery email
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (userData, thunkAPI) => {
    try {
      await sendRecoveryEmail(userData.email);
      return { message: 'Password reset email sent. Please check your inbox.' };
    } catch (error) {
      return thunkAPI.rejectWithValue(getAuthErrorMessage(error));
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        const isExistingUser = String(action.payload || '').toLowerCase().includes('user already exists');
        state.isError = !isExistingUser;
        state.message = isExistingUser ? '' : action.payload;
        state.user = null;
        localStorage.removeItem('user');
      })
      // Choose Role
      .addCase(chooseRole.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(chooseRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(chooseRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        localStorage.removeItem('user');
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload?.message || 'Password reset email sent. Please check your inbox.';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;
