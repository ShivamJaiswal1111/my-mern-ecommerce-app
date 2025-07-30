import express from 'express';
import Order from '../models/Order.js'; // Ensure correct path
import Product from '../models/Product.js'; // Ensure correct path
import Cart from '../models/Cart.js'; // Ensure correct path
import { protect, admin } from '../middleware/authMiddleware.js'; // Ensure correct path

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } else {
    try {
      // Check stock before creating order
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.name}` });
        }
        if (product.countInStock < item.qty) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}` });
        }
      }

      const order = new Order({
        user: req.user._id,
        orderItems: orderItems.map(item => ({
          ...item,
          product: item.product, // Ensure product is ObjectId
          _id: undefined // Remove _id from subdocument to let Mongoose create new ones
        })),
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      // After successful order creation, decrement stock and clear user's cart
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock -= item.qty;
          await product.save();
        }
      }

      // Clear the user's cart
      await Cart.deleteOne({ user: req.user._id });

      res.status(201).json(createdOrder);
    } catch (error) {
      console.error(`Error creating order for user ${req.user._id}: ${error.message}`);
      res.status(500).json({ message: 'Server Error: Could not create order' });
    }
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error(`Error fetching user orders for ${req.user._id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch user orders' });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
// Note: This route should typically come BEFORE generic /:id route if placed in the same router
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    console.error(`Error fetching all orders: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch all orders' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
// IMPORTANT: This route must come AFTER more specific GET routes like /myorders and /
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch order' });
  }
});

// @desc    Update order to paid (after payment gateway success)
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  const { id, status, update_time, email_address } = req.body; // Payment result from gateway

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id,
        status,
        update_time,
        email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error updating order ${req.params.id} to paid: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not update order to paid' });
  }
});


// @desc    Update order to delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error updating order ${req.params.id} to delivered: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not update order to delivered' });
  }
});


export default router;