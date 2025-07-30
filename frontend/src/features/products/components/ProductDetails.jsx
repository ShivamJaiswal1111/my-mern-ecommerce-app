import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux'; // <--- Ensure useDispatch is imported
import { addToCart } from '../../cart/cartSlice'; // <--- NEW IMPORT (adjust path if needed)

function ProductDetails() {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch(); // Initialize useDispatch hook

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Frontend calls backend directly on port 5001
        console.log(`Fetching product details for ID: ${id}`);
        const { data } = await axios.get(`http://localhost:5001/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product details:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]); // Re-fetch if ID changes

  const handleAddToCart = () => {
    // You can add a quantity selector later, for now, default to 1
    const qty = 1; // Default quantity when adding from details page
    if (product.countInStock >= qty) {
      dispatch(addToCart({ productId: product._id, qty }));
      console.log(`Added ${qty} of ${product.name} to cart.`);
      // Show success message/toast
    } else {
      console.log(`${product.name} is out of stock or requested quantity exceeds available.`);
      // Show error message
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading product details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>{error}</p>
        <Link to="/" style={{ color: '#61dafb' }}>Go back to products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <p>Product not found.</p>
        <Link to="/" style={{ color: '#61dafb' }}>Go back to products</Link>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#282c34',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Link to="/" style={{ alignSelf: 'flex-start', marginBottom: '20px', color: '#61dafb', textDecoration: 'none' }}>
        ← Back to Products
      </Link>

      <div style={{
        display: 'flex',
        flexDirection: 'column', // Changed to column for mobile/smaller screens
        alignItems: 'center',
        gap: '30px',
        maxWidth: '900px',
        width: '100%',
        backgroundColor: '#333',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '8px' }}
        />

        <div style={{ textAlign: 'left', width: '100%' }}>
          <h2 style={{ color: '#61dafb', marginBottom: '10px' }}>{product.name}</h2>
          <p style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Brand:</strong> {product.brand}</p>
          <p style={{ fontSize: '1.1em', marginBottom: '10px' }}><strong>Category:</strong> {product.category}</p>
          <p style={{ fontSize: '1.2em', marginBottom: '20px' }}><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
          <p style={{ marginBottom: '20px' }}>{product.description}</p>
          <p style={{ fontSize: '1em', color: '#ccc' }}>
            Stock: {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out Of Stock'}
          </p>
          <p style={{ fontSize: '1em', color: '#ccc' }}>
            Rating: {product.rating} stars ({product.numReviews} reviews)
          </p>

          <button
            disabled={product.countInStock === 0}
            style={{
              padding: '12px 25px',
              backgroundColor: product.countInStock === 0 ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1.1em',
              marginTop: '20px',
              transition: 'background-color 0.3s ease'
            }}
            onClick={handleAddToCart} // Call the new handler
          >
            {product.countInStock === 0 ? 'Out Of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;