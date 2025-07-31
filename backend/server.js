import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import multer from 'multer';
import { Router } from 'express';

// =========================================================================
// MODELS (ALL IN ONE FILE)
// =========================================================================
const orderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
});

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: { id: { type: String }, status: { type: String }, update_time: { type: String }, email_address: { type: String } },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { next(); }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    cartItems: [{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, default: 1 },
    }],
  }, { timestamps: true }
));

// =========================================================================
// MIDDLEWARE / HELPERS (ALL IN ONE FILE)
// =========================================================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) { res.status(401).json({ message: 'Not authorized, token failed' }); }
  }
  if (!token) { res.status(401).json({ message: 'Not authorized, no token' }); }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) { next(); } else { res.status(403).json({ message: 'Not authorized as an admin' }); }
};

// Multer upload configuration
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); }
});

const upload = multer({ storage: storage });

// =========================================================================
// MAIN APP & ROUTING (ALL IN ONE FILE)
// =========================================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

// FIX: Use a robust CORS middleware that handles both local and production origins
const vercelRegex = /^https:\/\/my-mern-ecommerce-app-n8j5(?:-[\w]+)?.vercel.app$/;
const allowedOrigins = [
  'http://localhost:4000',
  'https://my-mern-ecommerce-app-n8j5.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

app.use('/uploads', express.static('uploads'));

// Final App Routing
const userRoutes = Router();
userRoutes.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { return res.status(400).json({ message: 'User already exists' }); }
  const user = await User.create({ name, email, password });
  if (user) { res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) }); }
  else { res.status(400).json({ message: 'Invalid user data' }); }
});
userRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) { res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) }); }
  else { res.status(401).json({ message: 'Invalid email or password' }); }
});
userRoutes.get('/profile', protect, async (req, res) => {
  if (req.user) { res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, isAdmin: req.user.isAdmin }); }
  else { res.status(404).json({ message: 'User not found or not authorized' }); }
});
userRoutes.get('/', protect, admin, async (req, res) => {
  try { const users = await User.find({}); res.json(users); } catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch all users' }); }
});

const productRoutes = Router();
productRoutes.get('/', async (req, res) => {
  try { const products = await Product.find({}); res.json(products); } catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch products' }); }
});
productRoutes.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) { res.json(product); } else { res.status(404).json({ message: 'Product not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch product' }); }
});
productRoutes.post('/', protect, admin, async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;
  if (!name || !price || !description || !image || !brand || !category || countInStock === undefined) { res.status(400).json({ message: 'Please provide all required product fields' }); return; }
  try {
    const product = new Product({ name, price, user: req.user._id, image, brand, category, countInStock, numReviews: 0, description });
    const createdProduct = await product.save(); res.status(201).json(createdProduct);
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not create product' }); }
});
productRoutes.put('/:id', protect, admin, async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name; product.price = price || product.price; product.description = description || product.description; product.image = image || product.image; product.brand = brand || product.brand; product.category = category || product.category; product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      const updatedProduct = await product.save(); res.json(updatedProduct);
    } else { res.status(404).json({ message: 'Product not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not update product' }); }
});
productRoutes.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) { await Product.deleteOne({ _id: product._id }); res.json({ message: 'Product removed' }); }
    else { res.status(404).json({ message: 'Product not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not delete product' }); }
});

const uploadRoutes = Router();
uploadRoutes.post('/', upload.single('image'), (req, res) => {
  if (!req.file) { return res.status(400).json({ message: 'No image file provided.' }); }
  const relativePath = req.file.path.replace(/\\/g, '/');
  const fullImageUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;
  res.status(200).json({ message: 'Image uploaded successfully!', filePath: fullImageUrl });
});

const cartRoutes = Router();
cartRoutes.get('/', protect, async (req, res) => {
  try { const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name image price'); if (cart) { res.json(cart); } else { res.json({ user: req.user._id, cartItems: [] }); } }
  catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch cart' }); }
});
cartRoutes.post('/', protect, async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || qty === undefined || qty < 1) { return res.status(400).json({ message: 'Product ID and valid quantity are required.' }); }
  try {
    const product = await Product.findById(productId);
    if (!product) { return res.status(404).json({ message: 'Product not found.' }); }
    if (product.countInStock < qty) { return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}` }); }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) { cart = new Cart({ user: req.user._id, cartItems: [] }); }
    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) { cart.cartItems[itemIndex].qty = qty; }
    else { const cartItem = { product: productId, name: product.name, image: product.image, price: product.price, qty }; cart.cartItems.push(cartItem); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not add/update item in cart' }); }
});
cartRoutes.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params; let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) { return res.status(404).json({ message: 'Cart not found for this user.' }); }
    const initialLength = cart.cartItems.length; cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
    if (cart.cartItems.length === initialLength) { return res.status(404).json({ message: 'Product not found in cart.' }); }
    const updatedCart = await cart.save(); res.status(200).json(updatedCart);
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not remove item from cart' }); }
});

const orderRoutes = Router();
orderRoutes.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice } = req.body;
  if (orderItems && orderItems.length === 0) { return res.status(400).json({ message: 'No order items' }); }
  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) { return res.status(404).json({ message: `Product not found: ${item.name}` }); }
      if (product.countInStock < item.qty) { return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}` }); }
    }
    const order = new Order({ user: req.user._id, orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice });
    const createdOrder = await order.save();
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) { product.countInStock -= item.qty; await product.save(); }
    }
    await Cart.deleteOne({ user: req.user._id });
    res.status(201).json(createdOrder);
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not create order' }); }
});
orderRoutes.get('/myorders', protect, async (req, res) => {
  try { const orders = await Order.find({ user: req.user._id }); res.json(orders); }
  catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch user orders' }); }
});
orderRoutes.get('/', protect, admin, async (req, res) => {
  try { const orders = await Order.find({}).populate('user', 'id name'); res.json(orders); }
  catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch all orders' }); }
});
orderRoutes.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) { res.json(order); }
      else { res.status(403).json({ message: 'Not authorized to view this order' }); }
    } else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not fetch order' }); }
});
orderRoutes.put('/:id/pay', protect, async (req, res) => {
  const { id, status, update_time, email_address } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true; order.paidAt = Date.now(); order.paymentResult = { id, status, update_time, email_address };
      const updatedOrder = await order.save(); res.json(updatedOrder);
    } else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not update order to paid' }); }
});
orderRoutes.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true; order.deliveredAt = Date.now();
      const updatedOrder = await order.save(); res.json(updatedOrder);
    } else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error: Could not update order to delivered' }); }
});

// Final App Routing
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => { res.send('API is running...'); });

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Invalid JSON payload in request' });
  }
  next(err);
});

const connectDB = async () => {
  try { await mongoose.connect(MONGO_URI); console.log('MongoDB Connected Successfully!'); }
  catch (err) { console.error(`Error: ${err.message}`); process.exit(1); }
};

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => { console.log(`Server running on http://0.0.0.0:${PORT}`); });
});