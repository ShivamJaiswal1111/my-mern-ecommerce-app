import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk to create a new order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (order, { rejectWithValue, getState }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('Not authenticated. Please log in.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      // Frontend calls backend directly on port 5001
      const { data } = await axios.post('http://localhost:5001/api/orders', order, config);
      return data; // Returns the created order object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async Thunk to get order by ID
export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('Not authenticated. Please log in.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5001/api/orders/${orderId}`, config);
      return data; // Returns the fetched order object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetOrderState: (state) => { // To clear state after order creation or if user leaves
      state.order = null;
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload; // Store the created order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload; // Store the error message
        state.order = null;
      })
      // Handle getOrderById (NEW)
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload; // Store the fetched order
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.order = null;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;