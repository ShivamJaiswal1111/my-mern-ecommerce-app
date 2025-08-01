import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const calculateCartTotals = (items) => {
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  return { totalItems, totalPrice };
};

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('Not authenticated. Please log in.');
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('https://my-mern-ecommerce-app.onrender.com/api/cart', config);
      return { cart: data, ...calculateCartTotals(data.cartItems) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, qty }, { rejectWithValue, getState }) => {
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
      const { data } = await axios.post('https://my-mern-ecommerce-app.onrender.com/api/cart', { productId, qty }, config);
      return { cart: data, ...calculateCartTotals(data.cartItems || []) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('Not authenticated. Please log in.');
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.delete(`https://my-mern-ecommerce-app.onrender.com/api/cart/${productId}`, config);
      return { cart: data, ...calculateCartTotals(data.cartItems || []) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.loading = false;
      state.error = null;
    },
    clearCartError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cart.cartItems.map(item => ({
          ...item,
          product: item.product && item.product._id ? item.product._id : item.product,

        }));
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cartItems = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cart.cartItems.map(item => ({
          ...item,
          product: item.product && item.product._id ? item.product._id : item.product,

        }));
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cart.cartItems.map(item => ({
          ...item,
          product: item.product && item.product._id ? item.product._id : item.product,

        }));
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;