import mongoose from 'mongoose';

// Sub-schema for individual items within the cart
const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product', // References the Product model
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    default: 1, // Default quantity is 1
  },
});

// Main Cart Schema
const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // References the User model (each user has one cart)
      unique: true, // Ensures a user has only one cart document
    },
    cartItems: [cartItemSchema], // Array of cart items
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields for the cart itself
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;