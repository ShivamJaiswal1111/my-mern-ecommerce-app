import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // To check product stock/details
import { protect } from '../middleware/authMiddleware.js'; // Cart is user-specific

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name image price');
    if (cart) {
      res.json(cart);
    } else {
      // If cart doesn't exist for user, return an empty cart
      res.json({ user: req.user._id, cartItems: [] });
    }
  } catch (error) {
    console.error(`Error fetching cart for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch cart' });
  }
});

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  const { productId, qty } = req.body;

  console.log('--- ADD/UPDATE CART REQUEST ---'); // NEW LOG
  console.log('Incoming productId:', productId, 'Type:', typeof productId); // NEW LOG
  console.log('Incoming qty:', qty); // NEW LOG

  if (!productId || qty === undefined || qty < 1) {
    return res.status(400).json({ message: 'Product ID and valid quantity are required.' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.countInStock < qty) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}` });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    // If cart doesn't exist for this user, create a new one
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        cartItems: [],
      });
    }

    console.log('Current cartItems in DB (before findIndex):', cart.cartItems.map(item => ({ id: item.product.toString(), qty: item.qty }))); // NEW LOG

    const itemIndex = cart.cartItems.findIndex(item => {
      console.log(`Comparing Existing Item ID: ${item.product.toString()} with Incoming Product ID: ${productId}`); // NEW LOG
      console.log(`Match result: ${item.product.toString() === productId}`); // NEW LOG
      return item.product.toString() === productId;
    });

    if (itemIndex > -1) {
      console.log(`Product ${productId} found at index ${itemIndex}. Updating quantity.`); // NEW LOG
      // Item exists, update quantity
      cart.cartItems[itemIndex].qty = qty;
    } else {
      console.log(`Product ${productId} NOT found. Adding as new item.`);
      // Item does not exist, add new item
      const cartItem = {
        product: productId,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: qty,
      };
      cart.cartItems.push(cartItem);
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart); // Return the updated cart
  } catch (error) {
    console.error(`Error adding/updating cart item for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not add/update item in cart' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    // Filter out the item to be removed
    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);

    if (cart.cartItems.length === initialLength) {
        return res.status(404).json({ message: 'Product not found in cart.' });
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart); // Return the updated cart
  } catch (error) {
    console.error(`Error removing cart item for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not remove item from cart' });
  }
});

export default router;