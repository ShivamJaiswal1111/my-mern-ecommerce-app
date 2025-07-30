import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productReducer from '../features/products/productSlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import orderReducer from '../features/order/orderSlice.js'; // <--- NEW IMPORT

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    order: orderReducer, // <--- NEW SLICE
    // other slices will go here
  },
});

export default store;