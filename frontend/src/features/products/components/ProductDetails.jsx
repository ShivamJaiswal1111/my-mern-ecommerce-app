import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../cart/cartSlice';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`https://my-mern-ecommerce-app.onrender.com/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    const qty = 1;
    if (product?.countInStock >= qty) {
      dispatch(addToCart({ productId: product._id, qty }));
    } else {
      console.log('Product is out of stock.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading product details...</div>;
  }
  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }
  if (!product) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Product not found.</div>;
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
        flexDirection: 'column',
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
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <p>Stock: {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out Of Stock'}</p>
          <p>Rating: {product.rating} stars ({product.numReviews} reviews)</p>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            style={{
              padding: '12px 25px',
              backgroundColor: product.countInStock === 0 ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1.1em',
              marginTop: '20px'
            }}
          >
            {product.countInStock === 0 ? 'Out Of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;