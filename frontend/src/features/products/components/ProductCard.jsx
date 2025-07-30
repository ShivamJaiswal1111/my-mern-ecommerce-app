import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // <--- NEW IMPORT
import { addToCart } from '../../cart/cartSlice'; // <--- NEW IMPORT (adjust path if needed)

function ProductCard({ product }) {
  const dispatch = useDispatch(); // Initialize useDispatch hook

  const handleAddToCart = () => {
    // Basic validation before dispatching to cart
    if (product.countInStock > 0) {
      dispatch(addToCart({ productId: product._id, qty: 1 })); // Add 1 quantity by default
      console.log(`Added ${product.name} to cart.`);
      // In a real app, you'd show a success toast or notification here
    } else {
      console.log(`${product.name} is out of stock.`);
      // In a real app, you'd show an alert or message indicating out of stock
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px',
      width: '250px',
      textAlign: 'center',
      backgroundColor: '#333',
      color: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '10px' }}
        />
        <h3 style={{ fontSize: '1.2em', marginBottom: '5px' }}>{product.name}</h3>
        <p style={{ fontSize: '1em', color: '#bbb', marginBottom: '5px' }}>{product.brand}</p>
        <p style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#61dafb' }}>₹{product.price.toFixed(2)}</p>
      </Link>
      <button
        style={{
          padding: '10px 15px',
          backgroundColor: product.countInStock === 0 ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer',
          fontSize: '0.9em',
          marginTop: '10px',
        }}
        onClick={handleAddToCart} // Call the new handler
        disabled={product.countInStock === 0} // Disable button if out of stock
      >
        {product.countInStock === 0 ? 'Out Of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default ProductCard;