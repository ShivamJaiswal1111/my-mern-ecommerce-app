import express from 'express';
import Product from '../models/Product.js'; // Adjust path if needed
import { protect, admin } from '../middleware/authMiddleware.js'; // For admin routes

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch products' });
  }
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not fetch product' });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  // For simplicity, let's create a sample product with default admin user
  // In a real app, you'd get product data from req.body
  const { name, price, description, image, brand, category, countInStock } = req.body;

  // Basic validation
  if (!name || !price || !description || !image || !brand || !category || countInStock === undefined) {
    res.status(400).json({ message: 'Please provide all required product fields' });
    return;
  }

  try {
    const product = new Product({
      name: name,
      price: price,
      user: req.user._id, // Assign the product to the logged-in admin user
      image: image,
      brand: brand,
      category: category,
      countInStock: countInStock,
      numReviews: 0,
      description: description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(`Error creating product: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not create product' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error updating product ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not update product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id }); // Use deleteOne for Mongoose 6+
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: 'Server Error: Could not delete product' });
  }
});

export default router;